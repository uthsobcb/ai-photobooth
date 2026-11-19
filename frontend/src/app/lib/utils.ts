export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ")
}

// Cross-origin <a download> just navigates, so fetch the blob first.
export async function downloadImage(url: string) {
    const blob = await (await fetch(url)).blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = url.split("/").pop() || "photo.jpg"
    a.click()
    URL.revokeObjectURL(a.href)
}

export const API = process.env.NEXT_PUBLIC_API_URL

// Turn a data URL (from camera/upload) into a multipart body.
export async function toFormData(dataUrl: string, name = "photo.jpg", userId?: string) {
    const blob = await (await fetch(dataUrl)).blob()
    const fd = new FormData()
    if (userId) fd.append("user_id", userId) // only used by the backend's dev fallback; real auth is the token
    fd.append("file", new File([blob], name, { type: blob.type || "image/jpeg" }))
    return fd
}

// POST a photo, return parsed JSON; throws with the server's message.
export async function postPhoto(path: string, dataUrl: string, token?: string | null, userId?: string) {
    const res = await fetch(`${API}${path}`, {
        method: "POST",
        body: await toFormData(dataUrl, "photo.jpg", userId),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || "Something went wrong")
    return data
}

// Clerk session token as a header (empty if signed out).
export const bearer = (token: string | null): Record<string, string> =>
    token ? { Authorization: `Bearer ${token}` } : {}
