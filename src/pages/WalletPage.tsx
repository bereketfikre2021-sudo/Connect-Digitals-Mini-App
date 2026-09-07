import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay, formatDate } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TrendUpIcon, TrendDownIcon, RefreshIcon, CoinsIcon, InboxIcon, PlusIcon } from "@/components/ui/Icon";

interface WalletData { id: string; balanceETB: number; updatedAt: string }
interface TxData {
  transactions: Array<{ id: string; type: string; amountETB: number; balanceBefore: number; balanceAfter: number; description: string | null; reference: string | null; createdAt: string }>;
  total: number;
}

const TX_ICONS: Record<string, typeof TrendUpIcon> = { DEPOSIT: TrendUpIcon, REFUND: RefreshIcon, REWARD: CoinsIcon, ORDER_PAYMENT: TrendDownIcon, ADJUSTMENT: CoinsIcon };
const TX_CREDIT = new Set(["DEPOSIT", "REFUND", "REWARD"]);

export function WalletPage() {
  const navigate = useNavigate();

  const { data: wallet, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api.get<{ success: boolean; data: WalletData }>("/wallet").then(r => r.data.data),
  });

  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: () => api.get<{ success: boolean; data: TxData }>("/wallet/transactions").then(r => r.data.data),
  });

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Wallet" />

      {/* Balance hero */}
      <div style={{
        background:   "var(--hero-bg)",
        borderRadius: "var(--r-xl)",
        padding:      "var(--sp-6) var(--sp-5)",
        marginBottom: "var(--sp-5)",
        textAlign:    "center",
      }}>
        <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: "var(--sp-3)" }}>
          Available Balance
        </p>

        {walletLoading ? (
          <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="animate-spin" style={{ width: 28, height: 28, border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%" }} />
          </div>
        ) : walletError ? (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "var(--fs-base)" }}>Unable to load balance</p>
        ) : (
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-3xl)", fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
            {etbDisplay(wallet?.balanceETB ?? 0)}
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: 500, marginLeft: 8, color: "var(--cd-gold)" }}>ETB</span>
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/wallet/deposit")}
          style={{
            marginTop:    "var(--sp-5)",
            display:      "inline-flex",
            alignItems:   "center",
            gap:          6,
            background:   "var(--btn-hero-bg)",
            color:        "var(--btn-hero-text)",
            border:       "1px solid var(--btn-hero-border)",
            borderRadius: "var(--r-md)",
            padding:      "9px 18px",
            fontFamily:   "var(--font-heading)",
            fontWeight:   700,
            fontSize:     "var(--fs-sm)",
            cursor:       "pointer",
          }}
        >
          <PlusIcon size={14} color="var(--btn-hero-text)" /> Deposit Funds
        </button>
      </div>

      {/* Info note */}
      <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", padding: "var(--sp-3) var(--sp-4)", background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-md)", marginBottom: "var(--sp-5)" }}>
        <CoinsIcon size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>
          Your balance is credited when your deposit is approved. Use it to pay for orders instantly.
        </p>
      </div>

      {/* Transaction history */}
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--t1)", marginBottom: "var(--sp-3)" }}>
        Transactions
      </h2>

      {txLoading && <Spinner />}
      {txError && <ErrorMessage message="Failed to load transactions" onRetry={() => refetchTx()} />}

      {txData && txData.transactions.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--sp-10) var(--sp-4)", gap: "var(--sp-3)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <InboxIcon size={24} color="var(--t3)" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>No transactions yet.</p>
        </div>
      )}

      {txData && txData.transactions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {txData.transactions.map(tx => {
            const isCredit = TX_CREDIT.has(tx.type);
            const TxIcon   = TX_ICONS[tx.type] ?? CoinsIcon;
            return (
              <div
                key={tx.id}
                style={{
                  background:   "var(--surface)",
                  border:       "1px solid var(--divider)",
                  borderRadius: "var(--r-lg)",
                  padding:      "var(--sp-4)",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "var(--sp-4)",
                }}
              >
                {/* Icon */}
                <div style={{
                  width:          44, height: 44,
                  borderRadius:   "50%",
                  background:     isCredit ? "var(--s-success-bg)" : "var(--s-error-bg)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                }}>
                  <TxIcon size={18} color={isCredit ? "var(--s-success)" : "var(--s-error)"} aria-hidden="true" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <StatusBadge status={tx.type} />
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tx.description ?? tx.reference ?? formatDate(tx.createdAt)}
                  </p>
                </div>

                {/* Amount */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: isCredit ? "var(--s-success)" : "var(--s-error)" }}>
                    {isCredit ? "+" : "−"}{etbDisplay(tx.amountETB)}
                  </p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 2 }}>
                    Bal: {etbDisplay(tx.balanceAfter)} ETB
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
