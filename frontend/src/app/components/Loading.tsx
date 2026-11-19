export function LoadingOverlay({ text = "Working on it…" }: { text?: string }) {
    return (
        <div role="status" className="fixed inset-0 z-[60] flex items-center justify-center bg-mist/90 backdrop-blur-sm">
            <div className="space-y-6 text-center">
                <div className="focus-frame mx-auto h-24 w-24 animate-pulse rounded-2xl bg-booth/10" data-snap />
                <p className="font-display text-2xl font-bold">{text}</p>
            </div>
        </div>
    )
}
