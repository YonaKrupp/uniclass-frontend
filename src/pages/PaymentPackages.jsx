import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Package, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";

const packages = [
  { id: 1, name: "חבילת 4 שיעורים", lessons: 4, price: 400, description: "4 שיעורים פרטיים", color: "bg-chart-2/10 text-chart-2" },
  { id: 2, name: "חבילת 8 שיעורים", lessons: 8, price: 720, description: "חיסכון של 10%", color: "bg-chart-1/10 text-chart-1", badge: "פופולרי" },
  { id: 3, name: "חבילת 12 שיעורים", lessons: 12, price: 960, description: "חיסכון של 20%", color: "bg-chart-4/10 text-chart-4" },
];

export default function PaymentPackages() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || "";
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (pkg) => {
    setSelected(pkg.id);
    setLoading(true);
    setError("");
    try {
      const response = await base44.functions.invoke('create-checkout', {
        items: [{ name: pkg.name, quantity: 1, price: String(pkg.price) }],
        customerInfo: {
          email: userData.studentEmail || userData.email || "",
          firstName: userData.fullName || "",
          phone: userData.phone || "",
        },
      });
      if (response.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        setError(response.data?.error || "שגיאה ביצירת קישור התשלום");
      }
    } catch (err) {
      setError(err.message || "שגיאה בתהליך התשלום");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
          <Package className="w-7 h-7 text-primary" />
          רכישת חבילת שיעורים
        </h1>
        <p className="text-muted-foreground font-body">בחרו חבילה ועברו לתשלום מאובטח</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isSelected = selected === pkg.id;
          return (
            <div
              key={pkg.id}
              className={`bg-card rounded-2xl border-2 p-5 space-y-4 transition-all ${
                isSelected ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              {pkg.badge && (
                <span className="inline-block bg-primary text-primary-foreground text-xs font-heading font-bold px-2 py-1 rounded-full">
                  {pkg.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.color}`}>
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-lg text-foreground">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground font-body">{pkg.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-heading font-bold text-foreground">₪{pkg.price}</span>
                <span className="text-sm text-muted-foreground font-body">/{pkg.lessons} שיעורים</span>
              </div>
              <ul className="space-y-2 text-sm font-body text-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> {pkg.lessons} שיעורים פרטיים</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> תוקף 3 חודשים</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> תשלום מאובטח</li>
              </ul>
              <button
                onClick={() => handlePay(pkg)}
                disabled={loading && isSelected}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-heading font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading && isSelected ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> מכין תשלום...</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> שלם ₪{pkg.price}</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}