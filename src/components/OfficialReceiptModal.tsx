import React, { useRef, useState } from 'react';
import { X, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { PaymentRecord } from '../types';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PaymentRecord;
  userName: string;
}

export function OfficialReceiptModal({ isOpen, onClose, record, userName }: OfficialReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      setIsDownloading(true);
      
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width / 2, img.height / 2]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
      pdf.save(`Receipt_ApniSawari_${record.id.slice(0, 8)}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-[#f8f9fa] rounded-xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Action Bar (Not printed) */}
        <div className="bg-[#181c1c] px-4 py-3 flex items-center justify-between text-white print:hidden rounded-t-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Official Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadPDF} 
              disabled={isDownloading}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-xs" 
              title="Download PDF"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloading ? 'Saving...' : 'Download PDF'}</span>
            </button>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content (This gets printed) */}
        <div 
          ref={receiptRef}
          className="bg-white p-5 sm:p-6 relative overflow-hidden print:w-[800px] print:mx-auto print:shadow-none print:bg-transparent"
        >
          {/* Centered PAID & VERIFIED Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] pointer-events-none z-0">
            <div className="w-64 h-64 border-[8px] border-emerald-700 rounded-full flex flex-col items-center justify-center transform -rotate-[25deg]">
              <span className="text-emerald-700 font-black text-6xl tracking-widest uppercase mb-1">PAID</span>
              <div className="w-48 border-b-4 border-emerald-700 mb-2"></div>
              <span className="text-emerald-700 font-black text-3xl tracking-widest uppercase">VERIFIED</span>
              <span className="text-emerald-700 font-bold text-sm tracking-widest uppercase mt-2">Apni Sawari</span>
            </div>
          </div>
          
          {/* Security Pattern Border */}
          <div className="absolute inset-2 border-[1px] border-dashed border-neutral-300 pointer-events-none z-0 rounded-lg opacity-50"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center border-b-[1.5px] border-neutral-200 pb-4 mb-4">
              <div>
                <h1 className="text-xl font-black text-[#98001b] uppercase tracking-wider leading-tight">Apni Sawari Scheme</h1>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Official Committee & Lucky Draw</p>
              </div>
              
              {/* QR Code Placeholder / Security Seal */}
              <div className="w-12 h-12 border-2 border-[#181c1c] p-1 flex items-center justify-center opacity-80">
                <div className="w-full h-full bg-[#181c1c] opacity-20 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[6px] font-mono leading-[6px] break-all p-0.5 text-[#181c1c] overflow-hidden text-center opacity-60">
                    {btoa(record.id).substring(0, 50)}
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Details Header */}
            <div className="flex justify-end items-end mb-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-0.5">Date & Time</p>
                <p className="text-xs font-bold text-[#181c1c]">{record.date}</p>
              </div>
            </div>

            {/* Main Info */}
            <div className="bg-[#f8faf9] border border-[#e0e3e2] rounded-lg p-4 mb-4 shadow-sm">
              <div className="grid grid-cols-2 gap-y-3">
                <div>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Received From</p>
                  <p className="text-sm font-bold text-[#181c1c] uppercase">{userName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Token Number</p>
                  <p className="text-xs font-mono font-bold bg-[#ebeeed] inline-block px-1.5 py-0.5 rounded text-[#5b403f]">{record.userToken || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Scheme / Plan</p>
                  <p className="text-xs font-bold text-[#181c1c] uppercase">{record.projectName}</p>
                </div>
                <div className="col-span-2 pt-2.5 border-t border-neutral-200/60">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase mb-0.5">Payment Detail</p>
                  <p className="text-sm font-bold text-emerald-700">{record.installmentLabel}</p>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="flex justify-between items-center bg-[#181c1c] text-white p-4 rounded-lg mb-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-28 bg-[#98001b] -skew-x-12 translate-x-4"></div>
              <div className="relative z-10">
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mb-0.5">Amount Paid</p>
                <p className="text-2xl font-black">PKR {record.amount.toLocaleString()}</p>
              </div>
              <div className="relative z-10 text-right">
                <p className="text-[9px] text-white/70 uppercase font-bold mb-0.5">Status</p>
                <div className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">PAID</span>
                </div>
              </div>
            </div>

            {/* Footer / Meta */}
            <div className="grid grid-cols-2 gap-4 text-[10px] bg-neutral-50 border border-neutral-100 p-3 rounded-lg">
              <div>
                <p className="text-neutral-400 font-bold uppercase mb-0.5 text-[9px]">Transaction Ref</p>
                <p className="font-mono font-bold text-neutral-700 break-all">{record.transactionRef}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-400 font-bold uppercase mb-0.5 text-[9px]">Payment Method</p>
                <p className="font-bold text-neutral-700 uppercase">{record.paymentMethod}</p>
              </div>
            </div>

            {/* Authorised Signature */}
            <div className="mt-8 flex justify-between items-end border-t border-neutral-200 pt-4 relative">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Authorized By</p>
                <div className="font-[signature] font-['Dancing_Script','Brush_Script_MT',cursive] text-blue-800 text-3xl opacity-80 transform -rotate-3 ml-4 leading-none mb-1 select-none">
                  <span className="text-4xl">A</span>. Ali
                </div>
                <div className="border-b-[1.5px] border-neutral-800 w-32 pb-1"></div>
                <p className="text-[8px] font-bold uppercase text-neutral-400 mt-1">Admin Signature</p>
              </div>
              
              <div className="text-right">
                <p className="text-[8px] text-neutral-400 font-medium font-mono uppercase tracking-widest">
                  SYS-HASH: {record.id.slice(-8).toUpperCase()}-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
            
            <div className="text-center mt-5">
              <p className="text-[8px] text-neutral-400 mt-1 font-medium">
                This is a secure system-generated receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print styles injected directly to ensure modal prints perfectly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: absolute !important;
            background: transparent !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:w-\\[800px\\] {
            width: 800px !important;
          }
          .print\\:mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          .print\\:text-black * {
            color: black !important;
          }
          /* Ensure the specific receipt div and children are visible */
          div[ref] {
             visibility: visible !important;
             position: absolute;
             left: 0;
             top: 0;
             width: 100%;
          }
          div[ref] * {
            visibility: visible;
          }
        }
      `}} />
    </div>
  );
}
