import { ArrowRight, Bell, CheckCircle2, Clock3, Download, ExternalLink, FileCode2, KeyRound, LogOut, PackageCheck, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import SiteNav from "@/components/SiteNav";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

const statusLabel: Record<string, string> = {
  pending: "Payment pending",
  payment_verified: "Payment verified",
  paid: "Payment successful",
  fulfilled: "Delivered",
  cancelled: "Cancelled",
};

const paymentLabel: Record<string, string> = {
  pending: "Payment pending",
  verified: "Payment successful",
  failed: "Payment failed",
  refunded: "Payment refunded",
};

type PurchaseRow = {
  purchase: any;
  product: any;
  delivery: any;
  order: any;
  payment: any;
};

function DownloadButton({
  label,
  kind,
  purchaseId,
  download,
}: {
  label: string;
  kind: "source" | "documentation" | "license";
  purchaseId: number;
  download: ReturnType<typeof trpc.purchases.download.useMutation>;
}) {
  return (
    <button
      type="button"
      onClick={() => download.mutate({ purchaseId, kind })}
      disabled={download.isPending}
      className="flex items-center gap-2 text-sm text-[#83c2ff] disabled:opacity-40"
    >
      <Download size={14} /> {label}
    </button>
  );
}

function PurchaseCard({ row, download, review }: { row: PurchaseRow; download: ReturnType<typeof trpc.purchases.download.useMutation>; review: ReturnType<typeof trpc.reviews.create.useMutation> }) {
  const { purchase, product, delivery, order, payment } = row;
  const ready = delivery?.status === "ready" && purchase.accessGranted;
  const deliveryState = ready ? "delivery ready" : delivery?.status === "blocked" ? "delivery blocked" : `provisioning ${delivery?.status || "pending"}`;
  const deliveryTone = ready ? "bg-emerald-400/10 text-emerald-300" : delivery?.status === "blocked" ? "bg-red-400/10 text-red-300" : "bg-[#ef8b65]/10 text-[#f2a789]";

  return (
    <article className="glass rounded-[28px] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex gap-5">
          <img src={product.heroImage} alt={`${product.name} preview`} className="h-20 w-24 rounded-xl object-cover" />
          <div>
            <h2 className="text-2xl font-semibold text-white">{product.name}</h2>
            <p className="mt-1 text-sm text-white/45">Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}</p>
          </div>
        </div>
        <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] ${deliveryTone}`}>
          {ready ? <CheckCircle2 size={13} /> : delivery?.status === "blocked" ? <XCircle size={13} /> : <Clock3 size={13} />}
          {deliveryState}
        </span>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl bg-white/[.04] p-4 text-xs text-white/55"><ShieldCheck size={16} className="text-[#83c2ff]" /> {paymentLabel[payment?.status ?? "pending"]}</div>
        <div className="flex items-center gap-2 rounded-xl bg-white/[.04] p-4 text-xs text-white/55"><PackageCheck size={16} className="text-[#83c2ff]" /> {statusLabel[order?.status ?? "pending"]}</div>
        <div className="flex items-center gap-2 rounded-xl bg-white/[.04] p-4 text-xs text-white/55"><KeyRound size={16} className="text-[#83c2ff]" /> {purchase.licenseKey ? "License issued" : "License pending"}</div>
        <div className="flex items-center gap-2 rounded-xl bg-white/[.04] p-4 text-xs text-white/55"><FileCode2 size={16} className="text-[#83c2ff]" /> {ready ? "Protected access ready" : "Access gated"}</div>
      </div>

      {purchase.licenseKey && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-4">
          <div className="font-mono text-[9px] uppercase tracking-[.16em] text-white/35">License ID</div>
          <div className="mt-2 font-mono text-xs text-white/70">{purchase.licenseKey}</div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        {delivery?.instanceUrl && <a href={delivery.instanceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#83c2ff]">Open website <ExternalLink size={14} /></a>}{delivery?.sourceRepoUrl && <a href={delivery.sourceRepoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#83c2ff]">GitHub source <ExternalLink size={14} /></a>}
        {delivery?.adminUrl && <a href={delivery.adminUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#83c2ff]">Open admin <ExternalLink size={14} /></a>}
        {ready ? (
          <>
            <DownloadButton label="Source code" kind="source" purchaseId={purchase.id} download={download} />
            <DownloadButton label="Documentation" kind="documentation" purchaseId={purchase.id} download={download} />
            <DownloadButton label="License" kind="license" purchaseId={purchase.id} download={download} />
            <button type="button" onClick={() => { const rating = Number(window.prompt("Rating from 1 to 5", "5")); const body = window.prompt("Your review"); if (rating >= 1 && rating <= 5 && body) review.mutate({ productId: product.id, rating, title: null, body }); }} className="text-sm text-[#ef8b65] disabled:opacity-40" disabled={review.isPending}>Leave a review</button>
          </>
        ) : (
          <span className="text-sm text-white/35">Downloads unlock after verified payment and delivery.</span>
        )}
        <Link href={`/websites/${product.slug}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white">View product <ArrowRight size={14} /></Link>
      </div>
    </article>
  );
}

export default function Account() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const purchasesQuery = trpc.purchases.mine.useQuery(undefined, { enabled: isAuthenticated });
  const notificationsQuery = trpc.purchases.notifications.useQuery(undefined, { enabled: isAuthenticated });
  const paypalCapture = trpc.orders.paypalCapture.useMutation({ onSuccess: () => { purchasesQuery.refetch(); toast.success("PayPal payment confirmed"); }, onError: (error) => toast.error("PayPal payment could not be confirmed", { description: error.message }) });
  useEffect(() => { const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null; const paypalOrderId = params?.get("token"); const orderId = Number(params?.get("order_id")); if (paypalOrderId && Number.isInteger(orderId) && orderId > 0 && isAuthenticated && !paypalCapture.isPending) paypalCapture.mutate({ orderId, paypalOrderId }); }, [isAuthenticated]);
  const download = trpc.purchases.download.useMutation({
    onSuccess: (result) => {
      window.open(result.url, "_blank", "noopener,noreferrer");
      toast.success("Protected access issued");
    },
    onError: (error) => toast.error("Download unavailable", { description: error.message }),
  });
  const review = trpc.reviews.create.useMutation({ onSuccess: () => toast.success("Review submitted for moderation"), onError: (error) => toast.error("Review unavailable", { description: error.message }) });

  if (loading) return <div className="numi-shell min-h-screen bg-[#06111f] p-10 text-white/50">Checking your access…</div>;
  if (!isAuthenticated) {
    return <div className="numi-shell min-h-screen bg-[#06111f]"><SiteNav /><main className="mx-auto max-w-2xl px-5 py-20 md:px-10"><div className="glass rounded-[28px] p-8 md:p-12"><div className="mb-6 font-mono text-[10px] uppercase tracking-[.22em] text-[#83c2ff]">Customer access</div><h1 className="text-5xl font-semibold tracking-[-.07em] text-white">Your purchased systems, in one place.</h1><p className="mt-5 text-sm leading-7 text-white/50">Sign in to view delivery progress, licenses, and protected customer access.</p><a href="/api/oauth/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#06111f]">Sign in <ArrowRight size={15} /></a></div></main></div>;
  }

  const checkout = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("checkout") : null;
  return <div className="numi-shell numi-shell min-h-screen bg-[#06111f]"><div className="numi-content"><SiteNav /><main className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10"><div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-end"><div><div className="mb-5 font-mono text-[10px] uppercase tracking-[.22em] text-[#83c2ff]">Customer space / {user?.name || user?.email || "member"}</div><h1 className="text-5xl font-semibold tracking-[-.07em] text-white md:text-7xl">My purchases.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/50">Access stays tied to your account. Download links are issued only after payment verification and delivery readiness.</p></div><button type="button" onClick={() => logout()} className="flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2.5 text-xs text-white/55 transition-colors hover:border-white/40 hover:text-white"><LogOut size={14} /> Sign out</button></div>{checkout === "success" && <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5 text-sm text-emerald-100">Checkout returned successfully. Your account will show payment and delivery progress as Stripe confirms the event.</div>}{checkout === "cancelled" && <div className="mt-8 rounded-2xl border border-[#ef8b65]/20 bg-[#ef8b65]/10 p-5 text-sm text-[#f6c0aa]">Checkout was cancelled. The pending order remains gated and no delivery access was granted.</div>}{notificationsQuery.data?.length ? <section className="mt-8 grid gap-3 md:grid-cols-3">{notificationsQuery.data.slice(0, 3).map((notification) => <article key={notification.id} className="glass rounded-2xl p-4"><div className="flex items-center gap-2 text-[#83c2ff]"><Bell size={14} /><span className="text-xs font-semibold text-white">{notification.title}</span></div><p className="mt-2 text-xs leading-5 text-white/45">{notification.body}</p></article>)}</section> : null}<section className="mt-12">{purchasesQuery.isLoading ? <div className="glass rounded-[28px] p-10 text-white/50">Loading purchases…</div> : purchasesQuery.isError ? <div className="glass rounded-[28px] border-red-400/20 p-10"><h2 className="text-2xl font-semibold text-white">We could not load your purchases.</h2><p className="mt-3 text-sm leading-7 text-white/50">Your account is safe. Try again in a moment.</p></div> : purchasesQuery.data?.length ? <div className="space-y-5">{purchasesQuery.data.map((row) => <PurchaseCard key={row.purchase.id} row={row} download={download} review={review} />)}</div> : <div className="glass rounded-[28px] p-10"><h2 className="text-2xl font-semibold text-white">No purchases yet.</h2><p className="mt-3 max-w-md text-sm leading-7 text-white/50">Your next launch starts in the collection. When an order is verified and fulfilled, the delivery center will appear here.</p><Link href="/#collection" className="mt-6 inline-flex items-center gap-2 text-sm text-[#83c2ff]">Explore websites <ArrowRight size={15} /></Link></div>}</section></main></div></div>;
}
