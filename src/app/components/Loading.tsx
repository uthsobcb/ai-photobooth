export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xl font-semibold">We&apos;re verifying the face</p>
            </div>
        </div>
    )
}

