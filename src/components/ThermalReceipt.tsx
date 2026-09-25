import { useState } from 'react';
import { Order, Customer } from '../types';
import { formatIDR } from '../utils';
import { Printer, Check, AlertCircle, RefreshCw, FileText, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptConfig {
  address: string;
  phone: string;
  headerMessage: string;
  footerMessage: string;
  showLogo: boolean;
  paperWidth: '80mm' | '58mm';
}

interface ThermalReceiptProps {
  order: Order | null;
  customer: Customer | null;
  onClose: () => void;
  restaurantName: string;
  restaurantMotto: string;
  receiptConfig: ReceiptConfig;
}

export default function ThermalReceipt({
  order,
  customer,
  onClose,
  restaurantName,
  restaurantMotto,
  receiptConfig,
}: ThermalReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printPaperHeight, setPrintPaperHeight] = useState(0);

  if (!order) return null;

  // Read current connected printer from localStorage for display
  const connectedPrinter = (() => {
    const saved = localStorage.getItem('pos_printers');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const active = list.find((p: any) => p.connected);
        return active ? active.name : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  })();

  const handlePrint = () => {
    setIsPrinting(true);
    setPrintPaperHeight(0);
    setTimeout(() => {
      setPrintPaperHeight(100);
    }, 100);

    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 1500);
  };

  return (
    <div id="receipt-modal-container" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      {/* Dynamic print-only style overrides */}
      <style>{`
        @media print {
          /* Hide everything in the document */
          body * {
            visibility: hidden !important;
          }
          /* Show only the receipt area and its children */
          #receipt-print-area, #receipt-print-area * {
            visibility: visible !important;
          }
          /* Align print area to the absolute top-left */
          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          /* Remove print-hidden elements completely */
          .print\\:hidden, button, #receipt-modal-container button {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="text-indigo-600" size={18} />
            <span className="font-extrabold text-sm text-gray-900 tracking-tight font-sans">Cetak Struk Transaksi</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content: Receipt Preview scroll area */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col items-center">
          
          {/* Printer status indicator */}
          <div className="w-full max-w-[340px] mb-4">
            {connectedPrinter ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2 text-[10px] text-emerald-800 font-medium font-sans">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping shrink-0" />
                <span className="truncate">Printer: <strong>{connectedPrinter}</strong></span>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-150 rounded-xl flex items-center gap-2 text-[10px] text-amber-800 font-medium font-sans">
                <AlertCircle size={12} className="text-amber-600 shrink-0" />
                <span>Printer: <strong>System Default (Browser)</strong></span>
              </div>
            )}
          </div>

          {/* Virtual Thermal Receipt Paper Preview */}
          <div id="receipt-print-area" className="relative w-full flex flex-col items-center justify-start print:p-0 print:bg-white">
            
            {/* Live Preview Header bar (hidden when printing) */}
            <div className="w-full max-w-[340px] flex justify-between items-center mb-2 pb-1 text-slate-400 font-sans print:hidden">
              <span className="text-[9px] uppercase tracking-widest font-extrabold">Format Cetak</span>
              <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded font-mono uppercase">
                {receiptConfig.paperWidth}
              </span>
            </div>

            <div className={`relative w-full transition-all duration-300 ${receiptConfig.paperWidth === '58mm' ? 'max-w-[240px]' : 'max-w-[340px]'}`}>
              {/* Top jagged paper edge design */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden select-none pointer-events-none z-10 print:hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-white rotate-45 transform origin-top-left -translate-y-1.5 shrink-0 border-t border-l border-gray-200" />
                ))}
              </div>

              {/* Receipt Body */}
              <motion.div
                initial={{ scale: 0.98, opacity: 0.95 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  boxShadow: '0 4px 18px -2px rgba(0,0,0,0.06), 0 0 1px 1px rgba(0,0,0,0.02)'
                }}
                className={`bg-white p-4 pt-6 pb-8 text-gray-800 font-mono border border-gray-200 select-all print:border-0 print:p-0 print:shadow-none transition-all ${
                  receiptConfig.paperWidth === '58mm' ? 'text-[9px] leading-snug p-2.5' : 'text-xs'
                }`}
              >
                {/* Virtual Logo */}
                {receiptConfig.showLogo && (
                  <div className="text-center text-sm mb-1 text-indigo-600">
                    ☕🍽️
                  </div>
                )}

                {/* Header */}
                <div className="text-center space-y-0.5 mb-3">
                  <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-900 leading-tight">
                    {restaurantName}
                  </h2>
                  {restaurantMotto && (
                    <p className="italic text-[8px] text-slate-500 font-sans tracking-wide">
                      "{restaurantMotto}"
                    </p>
                  )}
                  {receiptConfig.address && (
                    <p className="text-[9px] leading-snug text-slate-600 font-sans">
                      {receiptConfig.address}
                    </p>
                  )}
                  {receiptConfig.phone && (
                    <p className="text-[9px] text-slate-600">
                      Telp: {receiptConfig.phone}
                    </p>
                  )}
                  {receiptConfig.headerMessage && (
                    <p className="text-[8px] text-slate-400 italic mt-1 border-t border-dashed border-gray-150 pt-1">
                      {receiptConfig.headerMessage}
                    </p>
                  )}
                  <div className="border-b border-dashed border-gray-200 my-1.5" />
                  
                  {/* Invoice Meta */}
                  <div className="text-left text-[9px] space-y-0.5 tabular-nums text-slate-600">
                    <div className="flex justify-between">
                      <span>Invoice:</span>
                      <span className="font-semibold text-slate-900">{order.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{order.cashier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{order.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode:</span>
                      <span className="font-bold uppercase text-slate-900">{order.paymentMethod}</span>
                    </div>
                    {order.isOffline && (
                      <div className="flex justify-between text-rose-600 font-semibold uppercase text-[8px]">
                        <span>Mode:</span>
                        <span>OFFLINE ENCRYPTED</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-b border-dashed border-gray-200 my-2" />

                {/* Items List */}
                <div className="space-y-1.5 mb-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>{item.product.name}</span>
                        <span className="tabular-nums font-bold">{formatIDR(item.product.price * item.quantity)}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 tabular-nums">
                        <span>{item.quantity} x {formatIDR(item.product.price)}</span>
                        {item.notes && <span className="font-sans italic">(* {item.notes})</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-gray-200 my-2" />

                {/* Financial Calculation summary */}
                <div className="space-y-0.5 text-right tabular-nums text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatIDR(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Diskon:</span>
                      <span>-{formatIDR(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Pajak (10%):</span>
                    <span>{formatIDR(order.tax)}</span>
                  </div>
                  <div className="border-b border-dashed border-gray-250 my-1" />
                  <div className="flex justify-between font-extrabold text-xs text-slate-950">
                    <span>GRAND TOTAL:</span>
                    <span>{formatIDR(order.grandTotal)}</span>
                  </div>
                  {order.cashReceived !== undefined && order.cashReceived > 0 && (
                    <>
                      <div className="border-b border-dotted border-gray-200 my-1" />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Bayar Cash:</span>
                        <span>{formatIDR(order.cashReceived)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-emerald-700 font-extrabold">
                        <span>Kembalian:</span>
                        <span>{formatIDR(order.changeAmount ?? 0)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-b border-dashed border-gray-200 my-2" />

                {/* Customer Details */}
                {customer ? (
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-150 text-[9px] space-y-0.5 font-sans">
                    <p className="font-extrabold text-slate-900 uppercase text-[8px] tracking-wider mb-1">MEMBER LOYALTY</p>
                    <div className="flex justify-between">
                      <span>Nama:</span>
                      <span className="font-semibold text-slate-950">{customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nomor Telp:</span>
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold tabular-nums">
                      <span>Poin Reward Baru:</span>
                      <span>+{Math.floor(order.grandTotal / 10000)} Pts ({customer.points + Math.floor(order.grandTotal / 10000)} Total)</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[8px] text-slate-400 italic">
                    -- Bukan Member Terdaftar --
                  </div>
                )}

                <div className="border-b border-dashed border-gray-200 my-3" />

                {/* Receipt Footer */}
                <div className="text-center space-y-0.5 text-[8px] text-slate-500">
                  <p className="font-extrabold uppercase text-slate-800">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                  {receiptConfig.footerMessage && <p className="leading-relaxed">{receiptConfig.footerMessage}</p>}
                  <p className="font-mono text-[7px] opacity-75 mt-1">Powered by QA POS • Cloud Sync Engine</p>
                </div>
              </motion.div>

              {/* Bottom jagged paper edge design */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 flex overflow-hidden select-none pointer-events-none z-10 print:hidden transform translate-y-1">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-white -rotate-45 transform origin-bottom-left -translate-y-1.5 shrink-0 border-b border-l border-gray-200" />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions: 3 clean, single-row action buttons */}
        <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/50 grid grid-cols-3 gap-2.5 shrink-0 print:hidden text-xs font-sans font-bold">
          <button
            onClick={onClose}
            className="py-2 border border-slate-250 text-slate-600 hover:text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>
          
          <button
            onClick={() => window.print()}
            className="py-2 bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-indigo-100 font-extrabold rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer text-center"
            title="Cetak struk ke file PDF berkualitas tinggi"
          >
            <FileText size={13} />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold rounded-xl flex items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
          >
            {isPrinting ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Printer size={12} />
                <span>Cetak Struk</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
