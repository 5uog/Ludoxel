import { ArrowUp, Mic, Plus } from 'lucide-react';

export default function AssistantPreview(): React.JSX.Element {
  return (
    <section className="py-10 md:py-14">
      <div className="w-full flex items-center justify-center" style={{ height: '40vh' }}>
        <div className="video-strip-placeholder" aria-hidden="true" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">Find answers faster with AI assistant.</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">A static helper for jumping through Ludoxel docs and project notes.</p>
        </div>

        <div className="flex flex-col w-full max-w-2xl mx-auto rounded-3xl border border-border overflow-hidden support-panel-background">
          <div className="flex flex-col gap-4 p-6 min-h-[300px] max-h-[400px] overflow-y-auto">
            <div className="text-center">
              <span className="text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">What can I help you with?</span>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <form className="search-bar-gradient-border bg-black rounded-xl">
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <input className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" placeholder="Ask a question..." readOnly type="text" value="" />

                <button
                  className="flex items-center justify-center w-8 h-8 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                  type="button"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#FFFFFF] text-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  disabled
                  type="submit"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
