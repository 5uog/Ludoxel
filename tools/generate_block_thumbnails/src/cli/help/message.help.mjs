/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const BLOCK_THUMBNAIL_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    title: Object.freeze({
      help: 'block thumbnail help',
      generate: 'block thumbnail generate',
      check: 'block thumbnail check',
    }),
    purpose: Object.freeze([
      'Ludoxel の既存 block model / state / face rendering code path から 300x300 RGBA PNG preview を生成又は検査する。',
      'tool 側では block geometry、connectivity、UV、face projection を定義しない。',
    ]),
    sections: Object.freeze([
      Object.freeze({
        heading: 'Commands',
        lines: Object.freeze([
          'assets:block-thumbnails:help       この help を表示する。',
          'assets:block-thumbnails:generate   既存 Ludoxel rendering API を呼び出して PNG を生成する。',
          'assets:block-thumbnails:check      入力、state、neighbor、既存 output PNG を検査する。',
        ]),
      }),
      Object.freeze({
        heading: 'Options',
        lines: Object.freeze([
          '--texture-root PATH          block/*.png を含む texture root。省略時は VisualAssetRoots の解決結果を使う。',
          '--output-root PATH           thumbnail 出力 directory。省略時は VisualAssetRoots の block thumbnail root を使う。',
          '--all                        登録済み block を全選択する。既定値。',
          '--block ID[,ID...]           対象 block id を指定する。',
          '--model-category CATEGORY    cube/full_block, slab, stairs, fence, fence_gate, wall のいずれかで絞り込む。',
          '--state KEY=VALUE            block state property override。複数回指定できる。',
          '--neighbor DIR=STATE         中心 block の connectivity 判定にだけ使う neighbor state context。DIR は north/east/south/west/up/down。',
          '--yaw DEG                    preview yaw。既定値 45。',
          '--pitch DEG                  preview pitch。既定値 30。',
          '--roll DEG                   preview roll。既定値 0。',
          '--scale FLOAT                fit 後の追加 scale。既定値 1。',
          '--fit-padding PX             透明余白。既定値 18。',
          '--dry-run                    generate の検査だけを行い、書き込まない。',
          '--allow-overwrite            既存 output PNG の上書きを許可する。',
          '--lang ja|en                 help language。--language と --locale も同じ。',
          '--help, -h, help             help を表示する。',
        ]),
      }),
      Object.freeze({
        heading: 'Connectivity',
        lines: Object.freeze([
          '--neighbor north=minecraft:oak_fence は north 側の隣接 state を context として渡す指定であり、隣接 block 自体を描画する指定ではない。',
          'fence で --neighbor がない場合は、代表 thumbnail として north-south の同種 neighbor context を使う。wall は north/south low、east/west none、center post enabled の state を使う。',
          '接続 arm の位置、高さ、太さは simulation model が決める。tool 側では作らない。',
        ]),
      }),
      Object.freeze({
        heading: 'Examples',
        lines: Object.freeze([
          'npm run assets:block-thumbnails:help -- --lang ja',
          'npm run assets:block-thumbnails:generate -- --help --lang en',
          'npm run assets:block-thumbnails:check -- --block minecraft:oak_fence --neighbor north=minecraft:oak_fence --neighbor south=minecraft:oak_fence --texture-root assets/ludoxel/textures/ --output-root assets/ludoxel/thumbnails/blocks/',
          'npm run assets:block-thumbnails:generate -- --block minecraft:stone_brick_wall --texture-root assets/ludoxel/textures/ --output-root assets/ludoxel/thumbnails/blocks/ --allow-overwrite',
        ]),
      }),
    ]),
  }),
  en: Object.freeze({
    title: Object.freeze({
      help: 'block thumbnail help',
      generate: 'block thumbnail generate',
      check: 'block thumbnail check',
    }),
    purpose: Object.freeze([
      'Generate or check 300x300 RGBA PNG previews through the existing Ludoxel block model, state, and face rendering code path.',
      'The repository tool does not define block geometry, connectivity, UVs, or face projection.',
    ]),
    sections: Object.freeze([
      Object.freeze({
        heading: 'Commands',
        lines: Object.freeze([
          'assets:block-thumbnails:help       Show this help.',
          'assets:block-thumbnails:generate   Generate PNG files through the existing Ludoxel rendering API.',
          'assets:block-thumbnails:check      Check inputs, states, neighbors, and existing output PNG files.',
        ]),
      }),
      Object.freeze({
        heading: 'Options',
        lines: Object.freeze([
          '--texture-root PATH          Texture root containing block/*.png. If omitted, VisualAssetRoots resolves the root.',
          '--output-root PATH           Thumbnail output directory. If omitted, VisualAssetRoots resolves the block thumbnail root.',
          '--all                        Select all registered blocks. This is the default.',
          '--block ID[,ID...]           Select one or more block ids.',
          '--model-category CATEGORY    Filter by cube/full_block, slab, stairs, fence, fence_gate, or wall.',
          '--state KEY=VALUE            Block-state property override. May be repeated.',
          '--neighbor DIR=STATE         Neighbor state context used only for center-block connectivity. DIR is north/east/south/west/up/down.',
          '--yaw DEG                    Preview yaw. Default is 45.',
          '--pitch DEG                  Preview pitch. Default is 30.',
          '--roll DEG                   Preview roll. Default is 0.',
          '--scale FLOAT                Additional scale after fitting. Default is 1.',
          '--fit-padding PX             Transparent padding. Default is 18.',
          '--dry-run                    Validate generate inputs without writing files.',
          '--allow-overwrite            Allow replacement of existing output PNG files.',
          '--lang ja|en                 Help language. --language and --locale are aliases.',
          '--help, -h, help             Show help.',
        ]),
      }),
      Object.freeze({
        heading: 'Connectivity',
        lines: Object.freeze([
          '--neighbor north=minecraft:oak_fence passes a north-side neighbor state as context; it does not request drawing the neighboring block.',
          'When fence has no --neighbor option, the representative thumbnail uses same-block north-south neighbor context. Wall uses north/south low, east/west none, and an enabled center post.',
          'The simulation model decides connection arm position, height, and thickness. The tool does not create those arms.',
        ]),
      }),
      Object.freeze({
        heading: 'Examples',
        lines: Object.freeze([
          'npm run assets:block-thumbnails:help -- --lang en',
          'npm run assets:block-thumbnails:generate -- --help --lang ja',
          'npm run assets:block-thumbnails:check -- --block minecraft:oak_fence --neighbor north=minecraft:oak_fence --neighbor south=minecraft:oak_fence --texture-root assets/ludoxel/textures/ --output-root assets/ludoxel/thumbnails/blocks/',
          'npm run assets:block-thumbnails:generate -- --block minecraft:stone_brick_wall --texture-root assets/ludoxel/textures/ --output-root assets/ludoxel/thumbnails/blocks/ --allow-overwrite',
        ]),
      }),
    ]),
  }),
});
