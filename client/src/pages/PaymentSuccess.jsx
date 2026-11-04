import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, LoaderCircle, AlertCircle, ArrowLeft } from "lucide-react";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Confirming your payment...");
  const captureStarted = useRef(false);

  useEffect(() => {
    const capturePayment = async () => {
      if (captureStarted.current) return;
      captureStarted.current = true;

      const orderId = searchParams.get("token");

      if (!orderId) {
        setStatus("error");
        setMessage("PayPal order ID was not found.");
        return;
      }

      try {
        const { data } = await axios.post(
          "http://localhost:8000/api/payments/capture-order",
          { orderId }
        );

        if (data.success) {
          setStatus("success");
          setMessage("Your payment has been completed successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Payment capture failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
          "Unable to confirm your payment. Please contact support."
        );
      }
    };

    capturePayment();
  }, [searchParams]);

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#151c2e] sm:p-10">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : isError
              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={38} />
          ) : isError ? (
            <AlertCircle size={38} />
          ) : (
            <LoaderCircle size={38} className="animate-spin" />
          )}
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          PayPilot payment
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isSuccess
            ? "Payment successful!"
            : isError
            ? "Payment confirmation failed"
            : "Processing payment"}
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          {message}
        </p>

        {status !== "processing" && (
          <Link
            to="/payments"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to Payments
          </Link>
        )}

        {status === "processing" && (
          <p className="mt-8 text-xs text-slate-400">
            Please don't close this page while we verify your transaction.
          </p>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
