"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import { toast } from "react-toastify";
import Image from "next/image";
import { PlusIcon, Trash2Icon, PencilIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { API, bearer } from "@/lib/utils";

interface Album {
    album_id: string;
    album_name: string;
    image_count?: number;
    cover?: string | null;
}

type Dialog = { kind: "create" } | { kind: "edit" | "delete"; album: Album } | null;

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [albums, setAlbums] = useState<Album[] | null>(null); // null = loading
    const [dialog, setDialog] = useState<Dialog>(null);
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);

    const [version, setVersion] = useState(0);
    const refresh = () => setVersion((v) => v + 1);

    useEffect(() => {
        if (!user?.id) return;
        let stale = false;
        (async () => {
            try {
                const response = await fetch(`${API}/fetch-albums?user_id=${user.id}`, {
                    headers: bearer(await getToken()),
                });
                if (!response.ok) throw new Error();
                const data = await response.json();
                if (!stale) setAlbums(data.albums);
            } catch {
                if (!stale) {
                    setAlbums((a) => a ?? []);
                    toast.error("Could not load your albums");
                }
            }
        })();
        return () => { stale = true; };
    }, [user?.id, getToken, version]);

    const open = (d: Dialog) => {
        setName(d && d.kind !== "create" ? d.album.album_name : "");
        setDialog(d);
    };

    // One request helper for create / edit / delete.
    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!dialog || busy) return;
        const trimmed = name.trim();
        if (dialog.kind !== "delete" && !trimmed) return;

        const [method, path, body] =
            dialog.kind === "create" ? ["POST", "/create_album", { album_name: trimmed }]
            : dialog.kind === "edit" ? ["PUT", "/edit_album", { album_id: dialog.album.album_id, new_album_name: trimmed }]
            : ["DELETE", "/delete_album", { album_id: dialog.album.album_id }];

        setBusy(true);
        try {
            const response = await fetch(`${API}${path}`, {
                method,
                headers: { "Content-Type": "application/json", ...bearer(await getToken()) },
                body: JSON.stringify({ ...body, user_id: user?.id }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || "Request failed");
            setDialog(null);
            if (dialog.kind === "create") return router.push(`/albums/${data.album_id}`);
            toast.success(dialog.kind === "edit" ? "Album renamed" : "Album deleted");
            refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Request failed");
        } finally {
            setBusy(false);
        }
    };

    if (isLoaded && !isSignedIn) {
        return (
            <main className="mx-auto max-w-6xl px-5 pt-32">
                <h1 className="text-4xl font-extrabold">Sign in to manage your albums</h1>
                <p className="mt-3 max-w-md text-ink/70">Albums belong to your account, so only you can add or delete photos.</p>
                <SignInButton mode="modal"><Button size="lg" className="mt-8">Sign in</Button></SignInButton>
            </main>
        );
    }

    const label = (d: Dialog) => d?.kind === "create" ? "Create album" : d?.kind === "edit" ? "Save name" : "Delete album";

    return (
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="text-4xl font-extrabold sm:text-5xl">Your albums</h1>
                <Button onClick={() => open({ kind: "create" })}><PlusIcon className="h-4 w-4" />New album</Button>
            </div>

            {albums === null && <p role="status" className="mt-12 text-ink/60">Loading your albums…</p>}
            {albums?.length === 0 && (
                <div className="mt-12 max-w-md rounded-3xl bg-white p-8">
                    <h2 className="text-xl font-bold">No albums yet</h2>
                    <p className="mt-2 text-ink/70">Create an album for your event, add its photos, then share the guest link.</p>
                    <Button className="mt-6" onClick={() => open({ kind: "create" })}>Create your first album</Button>
                </div>
            )}

            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums?.map((album) => (
                    <li key={album.album_id} className="group overflow-hidden rounded-3xl bg-white">
                        <Link href={`/albums/${album.album_id}`} className="block">
                            <div className="relative aspect-[4/3] bg-mist">
                                {album.cover ? (
                                    <Image src={`${API}/images/${album.cover}`} alt="" fill sizes="(max-width: 640px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <ImageIcon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-ink/25" />
                                )}
                            </div>
                        </Link>
                        <div className="flex items-center justify-between gap-3 p-4">
                            <Link href={`/albums/${album.album_id}`} className="min-w-0">
                                <h2 className="truncate font-display text-lg font-bold">{album.album_name}</h2>
                                <p className="text-sm text-ink/60">{album.image_count ?? 0} photo{album.image_count !== 1 && "s"}</p>
                            </Link>
                            <div className="flex shrink-0 gap-1">
                                <button aria-label={`Rename ${album.album_name}`} onClick={() => open({ kind: "edit", album })} className="rounded-full p-2 text-ink/60 hover:bg-mist hover:text-ink">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button aria-label={`Delete ${album.album_name}`} onClick={() => open({ kind: "delete", album })} className="rounded-full p-2 text-ink/60 hover:bg-alert/10 hover:text-alert">
                                    <Trash2Icon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <Modal
                open={!!dialog}
                onClose={() => setDialog(null)}
                title={dialog?.kind === "create" ? "New album" : dialog?.kind === "edit" ? "Rename album" : "Delete this album?"}
            >
                <form onSubmit={submit}>
                    {dialog?.kind === "delete" ? (
                        <p className="text-ink/70">
                            &ldquo;{dialog.album.album_name}&rdquo; and all its photos will be permanently deleted. Guest links stop working.
                        </p>
                    ) : (
                        <input
                            autoFocus
                            maxLength={80}
                            className="w-full rounded-xl bg-mist px-4 py-3"
                            placeholder="Maya & Dev's wedding"
                            aria-label="Album name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
                        <Button
                            type="submit"
                            variant={dialog?.kind === "delete" ? "danger" : "default"}
                            disabled={busy || (dialog?.kind !== "delete" && !name.trim())}
                        >
                            {label(dialog)}
                        </Button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
