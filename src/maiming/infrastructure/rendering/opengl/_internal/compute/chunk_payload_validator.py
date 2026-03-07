# FILE: src/maiming/infrastructure/rendering/opengl/_internal/compute/chunk_payload_validator.py
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Sequence

import numpy as np

from maiming.domain.world.chunking import ChunkKey

@dataclass(frozen=True)
class BucketPayloadDigest:
    bucket_index: int
    cpu_count: int
    gpu_count: int
    cpu_hash: str
    gpu_hash: str
    match: bool

@dataclass(frozen=True)
class PayloadValidationSummary:
    payload_name: str
    buckets: tuple[BucketPayloadDigest, ...]
    match: bool

@dataclass(frozen=True)
class ChunkPayloadValidationReport:
    chunk_key: ChunkKey
    world_revision: int
    world_payload: PayloadValidationSummary
    shadow_payload: PayloadValidationSummary
    ok: bool

@dataclass(frozen=True)
class ChunkPayloadMismatch:
    chunk_key: ChunkKey
    world_revision: int
    payload_name: str
    bucket_index: int
    cpu_count: int
    gpu_count: int
    cpu_hash: str
    gpu_hash: str
    first_mismatch_row: int | None
    first_mismatch_col: int | None
    cpu_row: tuple[float, ...] | None
    gpu_row: tuple[float, ...] | None
    cpu_row_words: tuple[str, ...] | None
    gpu_row_words: tuple[str, ...] | None
    cpu_value: float | None
    gpu_value: float | None
    cpu_word: str | None
    gpu_word: str | None

class ChunkPayloadMismatchError(RuntimeError):
    def __init__(self, *, mismatch: ChunkPayloadMismatch, report: ChunkPayloadValidationReport) -> None:
        self.mismatch = mismatch
        self.report = report
        super().__init__(_format_mismatch(mismatch))

def _normalize_chunk_key(chunk_key: ChunkKey) -> ChunkKey:
    return (int(chunk_key[0]), int(chunk_key[1]), int(chunk_key[2]))

def _normalize_bucket(
    bucket: np.ndarray,
    *,
    payload_name: str,
    bucket_index: int,
) -> np.ndarray:
    arr = bucket
    if arr.dtype != np.float32:
        arr = arr.astype(np.float32, copy=False)
    if not arr.flags["C_CONTIGUOUS"]:
        arr = np.ascontiguousarray(arr, dtype=np.float32)

    if arr.ndim != 2 or arr.shape[1] != 12:
        raise ValueError(
            f"{payload_name}[{int(bucket_index)}] must be a float32 Nx12 array, "
            f"but got shape={tuple(int(x) for x in arr.shape)}"
        )

    return arr

def _normalize_bucket_list(
    buckets: Sequence[np.ndarray],
    *,
    payload_name: str,
) -> tuple[np.ndarray, ...]:
    if len(buckets) != 6:
        raise ValueError(f"{payload_name} must contain exactly 6 face buckets")

    out: list[np.ndarray] = []
    for bi, bucket in enumerate(buckets):
        out.append(
            _normalize_bucket(
                bucket,
                payload_name=str(payload_name),
                bucket_index=int(bi),
            )
        )
    return tuple(out)

def _bucket_hash(arr: np.ndarray) -> str:
    h = hashlib.sha256()
    h.update(arr.view(np.uint8).tobytes(order="C"))
    return h.hexdigest()

def _row_tuple(arr: np.ndarray, row_index: int) -> tuple[float, ...] | None:
    ri = int(row_index)
    if ri < 0 or ri >= int(arr.shape[0]):
        return None
    return tuple(float(x) for x in arr[ri].tolist())

def _row_words(arr: np.ndarray, row_index: int) -> tuple[str, ...] | None:
    ri = int(row_index)
    if ri < 0 or ri >= int(arr.shape[0]):
        return None
    words = arr[ri].view(np.uint32)
    return tuple(f"0x{int(w):08X}" for w in words.tolist())

def _find_first_mismatch(
    cpu: np.ndarray,
    gpu: np.ndarray,
) -> tuple[
    int | None,
    int | None,
    tuple[float, ...] | None,
    tuple[float, ...] | None,
    tuple[str, ...] | None,
    tuple[str, ...] | None,
    float | None,
    float | None,
    str | None,
    str | None,
]:
    cpu_rows = int(cpu.shape[0])
    gpu_rows = int(gpu.shape[0])
    shared_rows = min(cpu_rows, gpu_rows)

    for ri in range(shared_rows):
        cpu_words = cpu[ri].view(np.uint32)
        gpu_words = gpu[ri].view(np.uint32)
        if np.array_equal(cpu_words, gpu_words):
            continue

        mismatch_col: int | None = None
        cpu_value: float | None = None
        gpu_value: float | None = None
        cpu_word: str | None = None
        gpu_word: str | None = None

        for ci in range(int(cpu.shape[1])):
            c_word = int(cpu_words[ci])
            g_word = int(gpu_words[ci])
            if c_word == g_word:
                continue

            mismatch_col = int(ci)
            cpu_value = float(cpu[ri, ci])
            gpu_value = float(gpu[ri, ci])
            cpu_word = f"0x{c_word:08X}"
            gpu_word = f"0x{g_word:08X}"
            break

        return (
            int(ri),
            mismatch_col,
            _row_tuple(cpu, int(ri)),
            _row_tuple(gpu, int(ri)),
            _row_words(cpu, int(ri)),
            _row_words(gpu, int(ri)),
            cpu_value,
            gpu_value,
            cpu_word,
            gpu_word,
        )

    if cpu_rows != gpu_rows:
        ri = int(shared_rows)
        return (
            ri,
            None,
            _row_tuple(cpu, ri),
            _row_tuple(gpu, ri),
            _row_words(cpu, ri),
            _row_words(gpu, ri),
            None,
            None,
            None,
            None,
        )

    return (None, None, None, None, None, None, None, None, None, None)

def _compare_payload(
    *,
    chunk_key: ChunkKey,
    world_revision: int,
    payload_name: str,
    cpu_buckets: Sequence[np.ndarray],
    gpu_buckets: Sequence[np.ndarray],
) -> tuple[PayloadValidationSummary, ChunkPayloadMismatch | None]:
    cpu_norm = _normalize_bucket_list(cpu_buckets, payload_name=f"cpu_{str(payload_name)}")
    gpu_norm = _normalize_bucket_list(gpu_buckets, payload_name=f"gpu_{str(payload_name)}")

    digests: list[BucketPayloadDigest] = []
    first_mismatch: ChunkPayloadMismatch | None = None

    for bi in range(6):
        cpu_arr = cpu_norm[bi]
        gpu_arr = gpu_norm[bi]

        cpu_count = int(cpu_arr.shape[0])
        gpu_count = int(gpu_arr.shape[0])

        cpu_hash = _bucket_hash(cpu_arr)
        gpu_hash = _bucket_hash(gpu_arr)

        match = bool(cpu_count == gpu_count and cpu_hash == gpu_hash)

        digests.append(
            BucketPayloadDigest(
                bucket_index=int(bi),
                cpu_count=int(cpu_count),
                gpu_count=int(gpu_count),
                cpu_hash=str(cpu_hash),
                gpu_hash=str(gpu_hash),
                match=bool(match),
            )
        )

        if bool(match) or first_mismatch is not None:
            continue

        (
            row_index,
            col_index,
            cpu_row,
            gpu_row,
            cpu_row_words,
            gpu_row_words,
            cpu_value,
            gpu_value,
            cpu_word,
            gpu_word,
        ) = _find_first_mismatch(cpu_arr, gpu_arr)

        first_mismatch = ChunkPayloadMismatch(
            chunk_key=_normalize_chunk_key(chunk_key),
            world_revision=int(world_revision),
            payload_name=str(payload_name),
            bucket_index=int(bi),
            cpu_count=int(cpu_count),
            gpu_count=int(gpu_count),
            cpu_hash=str(cpu_hash),
            gpu_hash=str(gpu_hash),
            first_mismatch_row=row_index,
            first_mismatch_col=col_index,
            cpu_row=cpu_row,
            gpu_row=gpu_row,
            cpu_row_words=cpu_row_words,
            gpu_row_words=gpu_row_words,
            cpu_value=cpu_value,
            gpu_value=gpu_value,
            cpu_word=cpu_word,
            gpu_word=gpu_word,
        )

    summary = PayloadValidationSummary(
        payload_name=str(payload_name),
        buckets=tuple(digests),
        match=all(bool(d.match) for d in digests),
    )
    return summary, first_mismatch

def _format_mismatch(mismatch: ChunkPayloadMismatch) -> str:
    ck = mismatch.chunk_key
    return (
        "GPU payload validation failed for "
        f"chunk=({int(ck[0])}, {int(ck[1])}, {int(ck[2])}), "
        f"world_revision={int(mismatch.world_revision)}, "
        f"payload={str(mismatch.payload_name)}, "
        f"bucket_index={int(mismatch.bucket_index)}, "
        f"cpu_count={int(mismatch.cpu_count)}, "
        f"gpu_count={int(mismatch.gpu_count)}, "
        f"cpu_hash={str(mismatch.cpu_hash)}, "
        f"gpu_hash={str(mismatch.gpu_hash)}, "
        f"first_mismatch_row={mismatch.first_mismatch_row!r}, "
        f"first_mismatch_col={mismatch.first_mismatch_col!r}, "
        f"cpu_value={mismatch.cpu_value!r}, "
        f"gpu_value={mismatch.gpu_value!r}, "
        f"cpu_word={mismatch.cpu_word!r}, "
        f"gpu_word={mismatch.gpu_word!r}, "
        f"cpu_row={mismatch.cpu_row!r}, "
        f"gpu_row={mismatch.gpu_row!r}, "
        f"cpu_row_words={mismatch.cpu_row_words!r}, "
        f"gpu_row_words={mismatch.gpu_row_words!r}"
    )

def validate_chunk_payloads(
    *,
    chunk_key: ChunkKey,
    world_revision: int,
    cpu_world_faces: Sequence[np.ndarray],
    cpu_shadow_faces: Sequence[np.ndarray],
    gpu_world_faces: Sequence[np.ndarray],
    gpu_shadow_faces: Sequence[np.ndarray],
) -> ChunkPayloadValidationReport:
    ck = _normalize_chunk_key(chunk_key)
    rev = int(world_revision)

    world_summary, world_mismatch = _compare_payload(
        chunk_key=ck,
        world_revision=int(rev),
        payload_name="world_faces",
        cpu_buckets=cpu_world_faces,
        gpu_buckets=gpu_world_faces,
    )
    shadow_summary, shadow_mismatch = _compare_payload(
        chunk_key=ck,
        world_revision=int(rev),
        payload_name="shadow_faces",
        cpu_buckets=cpu_shadow_faces,
        gpu_buckets=gpu_shadow_faces,
    )

    report = ChunkPayloadValidationReport(
        chunk_key=ck,
        world_revision=int(rev),
        world_payload=world_summary,
        shadow_payload=shadow_summary,
        ok=bool(world_summary.match and shadow_summary.match),
    )

    mismatch = world_mismatch if world_mismatch is not None else shadow_mismatch
    if mismatch is not None:
        raise ChunkPayloadMismatchError(mismatch=mismatch, report=report)

    return report