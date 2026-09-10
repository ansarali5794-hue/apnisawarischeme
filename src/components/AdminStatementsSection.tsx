import React, { useState, useMemo, useDeferredValue } from 'react';
import {
  Building2,
  Calendar,
  Download,
  Loader2,
  Search,
  Smartphone,
  FileSpreadsheet,
  Eye,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentRecord, BankAccountDetail, UserProfile, VehicleProject } from '../types';

interface AdminStatementsSectionProps {
  payments: PaymentRecord[];
  bankAccounts: BankAccountDetail[];
  users: UserProfile[];
  projects: VehicleProject[];
  onViewSlip?: (url: string, title: string) => void;
}

// ------------------------------------------------------------------
// Memoized Statement Row Component for High-Performance Rendering
// ------------------------------------------------------------------
interface StatementRowProps {
  payment: PaymentRecord;
  onViewSlip?: (url: string, title: string) => void;
}

const StatementRow = React.memo<StatementRowProps>(({ payment, onViewSlip }) => {
  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <td className="p-3 font-mono whitespace-nowrap text-[11px] text-neutral-600 dark:text-neutral-400">
        {payment.date}
      </td>
      <td className="p-3">
        <div className="font-bold text-[#181c1c] dark:text-white">
          {payment.userName || 'Member'}
        </div>
        <span className="font-mono text-[10px] text-[#98001b] font-bold">
          {payment.userToken || 'N/A'}
        </span>
      </td>
      <td className="p-3">
        <div className="font-semibold text-xs">{payment.projectName}</div>
        <span className="text-[10px] text-neutral-500">{payment.installmentLabel}</span>
      </td>
      <td className="p-3 font-semibold text-[11px] text-[#775a19] dark:text-[#fed488]">
        {payment.paymentMethod || 'Head Office Cash'}
      </td>
      <td className="p-3 font-mono text-[10px] text-neutral-500">
        {payment.transactionRef}
      </td>
      <td className="p-3 text-right font-mono font-black text-xs text-[#98001b] dark:text-[#ffb3b0]">
        PKR {payment.amount.toLocaleString()}
      </td>
      <td className="p-3 text-center">
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
            payment.status === 'PAID'
              ? 'bg-emerald-100 text-emerald-800'
              : payment.status === 'UNDER_REVIEW'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {payment.status}
        </span>
      </td>
      <td className="p-3 text-center">
        {payment.receiptUrl ? (
          <button
            type="button"
            onClick={() => onViewSlip && onViewSlip(payment.receiptUrl!, `${payment.userName} (${payment.transactionRef})`)}
            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            title="View Slip"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-neutral-400 text-[10px]">-</span>
        )}
      </td>
    </tr>
  );
});

// ------------------------------------------------------------------
// Main Statements & Ledger Section
// ------------------------------------------------------------------
export const AdminStatementsSection: React.FC<AdminStatementsSectionProps> = ({
  payments,
  bankAccounts,
  users,
  projects,
  onViewSlip
}) => {
  const [statementMode, setStatementMode] = useState<'specific' | 'general'>('specific');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || 'all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const deferredSearch = useDeferredValue(searchFilter);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Selected Bank Account object
  const selectedAccount = useMemo(() => {
    return bankAccounts.find((a) => a.id === selectedAccountId);
  }, [bankAccounts, selectedAccountId]);

  // Filter payments based on mode, account, dates, and deferred search
  const filteredPayments = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return (payments || []).filter((p) => {
      // 1. Account Filter (if specific mode)
      if (statementMode === 'specific' && selectedAccount) {
        const matchMethod =
          (p.paymentMethod &&
            (p.paymentMethod.toLowerCase().includes(selectedAccount.title.toLowerCase()) ||
              p.paymentMethod.toLowerCase().includes(selectedAccount.accountTitle.toLowerCase()) ||
              p.paymentMethod.toLowerCase().includes(selectedAccount.methodType.toLowerCase()) ||
              (selectedAccount.bankName && p.paymentMethod.toLowerCase().includes(selectedAccount.bankName.toLowerCase())))) ||
          false;
        if (!matchMethod) return false;
      }

      // 2. Date Filter
      if (dateFrom) {
        const pDate = new Date(p.date);
        const fDate = new Date(dateFrom);
        if (!isNaN(pDate.getTime()) && !isNaN(fDate.getTime()) && pDate < fDate) {
          return false;
        }
      }
      if (dateTo) {
        const pDate = new Date(p.date);
        const tDate = new Date(dateTo);
        if (!isNaN(pDate.getTime()) && !isNaN(tDate.getTime()) && pDate > tDate) {
          return false;
        }
      }

      // 3. Text Search Filter
      if (query) {
        const name = (p.userName || '').toLowerCase();
        const token = (p.userToken || '').toLowerCase();
        const ref = (p.transactionRef || '').toLowerCase();
        const proj = (p.projectName || '').toLowerCase();
        const method = (p.paymentMethod || '').toLowerCase();
        if (!name.includes(query) && !token.includes(query) && !ref.includes(query) && !proj.includes(query) && !method.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statementMode, selectedAccount, dateFrom, dateTo, deferredSearch]);

  // Calculate Metrics via useMemo
  const totalVerifiedPaid = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const totalUnderReview = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === 'UNDER_REVIEW' || p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const totalTransactionsCount = filteredPayments.length;

  const uniquePayingMembers = useMemo(() => {
    return new Set(filteredPayments.map((p) => p.userToken || p.userId || p.userName)).size;
  }, [filteredPayments]);

  // Account Breakdown for General Statement
  const accountTotalsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const acc of bankAccounts) {
      const total = payments
        .filter((p) => {
          if (p.status !== 'PAID') return false;
          const match =
            p.paymentMethod &&
            (p.paymentMethod.toLowerCase().includes(acc.title.toLowerCase()) ||
              p.paymentMethod.toLowerCase().includes(acc.accountTitle.toLowerCase()) ||
              p.paymentMethod.toLowerCase().includes(acc.methodType.toLowerCase()) ||
              (acc.bankName && p.paymentMethod.toLowerCase().includes(acc.bankName.toLowerCase())));
          return match;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      map.set(acc.id, total);
    }
    return map;
  }, [payments, bankAccounts]);

  // Paginated Payments Slice
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedPayments = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, effectivePage, pageSize]);

  // State for generating PDF
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // High quality PDF download handler using jsPDF + autoTable
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      // Give React time to show loading state
      await new Promise((resolve) => setTimeout(resolve, 80));

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Header Brand Stripe
      doc.setFillColor(152, 0, 27); // #98001b
      doc.rect(0, 0, pageWidth, 24, 'F');

      // Gold Accent Line
      doc.setFillColor(233, 193, 118); // #e9c176
      doc.rect(0, 24, pageWidth, 1.5, 'F');

      // Organization Header Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('APNI SAWARI SCHEME', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(255, 220, 225);
      doc.text('OFFICIAL ACCOUNT STATEMENT & FINANCIAL REPORT', 14, 18);

      // Statement Metadata Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(24, 28, 28);

      const statementTitle =
        statementMode === 'specific'
          ? `Account: ${selectedAccount?.title || 'Selected Account'} (${selectedAccount?.accountNumber || selectedAccount?.branchOrIban || 'N/A'}) - ${selectedAccount?.accountTitle || ''}`
          : 'Consolidated General Statement (All Bank & Cash Accounts)';
      doc.text(statementTitle, 14, 33);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 95, 95);

      const periodText =
        dateFrom || dateTo
          ? `Date Range: ${dateFrom || 'Start'} to ${dateTo || 'Today'}`
          : 'Date Range: Lifetime / All Transactions Recorded';
      doc.text(periodText, 14, 38);

      const generatedOnText = `Generated on: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      doc.text(generatedOnText, 14, 43);

      // KPI Summary Box
      doc.setFillColor(248, 250, 249);
      doc.setDrawColor(224, 227, 226);
      doc.roundedRect(14, 47, pageWidth - 28, 17, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 105, 105);
      doc.text('TOTAL VERIFIED (PAID)', 18, 53);
      doc.text('UNDER REVIEW / PENDING', 75, 53);
      doc.text('TRANSACTIONS', 130, 53);
      doc.text('MEMBERS', 168, 53);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 149, 106); // Emerald
      doc.text(`PKR ${totalVerifiedPaid.toLocaleString()}`, 18, 60);

      doc.setTextColor(180, 110, 0); // Amber
      doc.text(`PKR ${totalUnderReview.toLocaleString()}`, 75, 60);

      doc.setTextColor(24, 28, 28);
      doc.text(`${filteredPayments.length} Slips`, 130, 60);
      doc.text(`${uniquePayingMembers} Users`, 168, 60);

      // Prepare Table Data
      const tableData = filteredPayments.map((p, index) => [
        String(index + 1),
        p.date || 'N/A',
        `${p.userName || 'Member'}\nToken: ${p.userToken || 'N/A'}`,
        `${p.projectName || 'Scheme'}\n${p.installmentLabel || ''}`,
        `${p.paymentMethod || 'Head Office'}\nRef: ${p.transactionRef || 'N/A'}`,
        `PKR ${p.amount.toLocaleString()}`,
        p.status || 'PAID'
      ]);

      autoTable(doc, {
        head: [['#', 'Date', 'Member & Token', 'Scheme / Installment', 'Method & TRX', 'Amount', 'Status']],
        body: tableData,
        startY: 68,
        theme: 'striped',
        headStyles: {
          fillColor: [152, 0, 27],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 2.5
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: [230, 233, 232],
          lineWidth: 0.1,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [250, 252, 251]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 20 },
          2: { cellWidth: 38 },
          3: { cellWidth: 40 },
          4: { cellWidth: 42 },
          5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 17, halign: 'center' }
        },
        didDrawPage: () => {
          // Footer on every page
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(140, 140, 140);
          const pageStr = `Page ${doc.getNumberOfPages()}`;
          doc.text('Apni Sawari Scheme Management System - Computer Generated Official Record', 14, pageHeight - 7);
          doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 7);
        }
      });

      // Filename
      const cleanAcc =
        statementMode === 'specific'
          ? (selectedAccount?.title || 'Account').replace(/[^a-zA-Z0-9]/g, '_')
          : 'General_Statement';
      const cleanDate = dateFrom ? `${dateFrom}_to_${dateTo || 'today'}` : 'All_Dates';
      const filename = `ApniSawari_Statement_${cleanAcc}_${cleanDate}.pdf`;

      doc.save(filename);
    } catch (err) {
      console.error('Failed to export PDF statement:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#98001b]/10 text-[#98001b] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase tracking-wider">
              Account Statements & Financial Reports
            </h3>
          </div>
          <p className="text-xs text-neutral-500 font-urdu mt-0.5">
                        
          </p>
        </div>

        {/* Tab Switcher: Specific vs General Statement */}
        <div className="flex items-center bg-[#f1f4f3] dark:bg-neutral-800 p-1 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setStatementMode('specific');
              setCurrentPage(1);
            }}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold font-['Montserrat'] uppercase transition-all cursor-pointer ${
              statementMode === 'specific'
                ? 'bg-[#98001b] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900'
            }`}
          >
            Specific Account
          </button>
          <button
            type="button"
            onClick={() => {
              setStatementMode('general');
              setCurrentPage(1);
            }}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold font-['Montserrat'] uppercase transition-all cursor-pointer ${
              statementMode === 'general'
                ? 'bg-[#98001b] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900'
            }`}
          >
            General Statement
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Specific Mode: Select Bank Account */}
          {statementMode === 'specific' && (
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                Select Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
              >
                {(bankAccounts || []).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.title} ({acc.accountNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date From */}
          <div className={statementMode === 'general' ? 'sm:col-span-2' : ''}>
            <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#98001b]" />
              <span>Date From</span>
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
            />
          </div>

          {/* Date To */}
          <div className={statementMode === 'general' ? 'sm:col-span-2' : ''}>
            <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#98001b]" />
              <span>Date To</span>
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
            />
          </div>

          {/* Search Filter */}
          {statementMode === 'specific' && (
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                Filter Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Customer, Token, Ref..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Print & PDF */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e0e3e2] dark:border-neutral-700">
          <div className="text-xs text-neutral-500 font-urdu">
                 <strong>{filteredPayments.length}</strong>   
          </div>

          <div className="flex items-center gap-2">
            {(dateFrom || dateTo || searchFilter) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSearchFilter('');
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 cursor-pointer"
              >
                Clear Filters
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf || filteredPayments.length === 0}
              className="bg-[#98001b] hover:bg-[#800016] text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title="Download Statement as PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
          <span className="text-[10px] text-neutral-500 font-bold uppercase block">
            Total Credited
          </span>
          <p className="font-['Montserrat'] font-black text-lg text-emerald-600 dark:text-emerald-400 mt-1">
            PKR {totalVerifiedPaid.toLocaleString()}
          </p>
          <span className="text-[10px] text-neutral-500 font-semibold font-urdu">  </span>
        </div>

        <div className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
          <span className="text-[10px] text-neutral-500 font-bold uppercase block">
            Under Review
          </span>
          <p className="font-['Montserrat'] font-black text-lg text-amber-600 dark:text-amber-400 mt-1">
            PKR {totalUnderReview.toLocaleString()}
          </p>
          <span className="text-[10px] text-neutral-500 font-semibold font-urdu"> </span>
        </div>

        <div className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
          <span className="text-[10px] text-neutral-500 font-bold uppercase block">
            Total Slips
          </span>
          <p className="font-['Montserrat'] font-black text-lg text-[#98001b] dark:text-[#ffb3b0] mt-1">
            {totalTransactionsCount} Slips
          </p>
          <span className="text-[10px] text-neutral-500 font-semibold font-urdu">  </span>
        </div>

        <div className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
          <span className="text-[10px] text-neutral-500 font-bold uppercase block">
            Paying Members
          </span>
          <p className="font-['Montserrat'] font-black text-lg text-[#181c1c] dark:text-white mt-1">
            {uniquePayingMembers} Users
          </p>
          <span className="text-[10px] text-neutral-500 font-semibold font-urdu">   </span>
        </div>
      </div>

      {/* General Statement: Channel Breakdown Grid */}
      {statementMode === 'general' && (
        <div className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs space-y-3">
          <h4 className="font-['Montserrat'] font-bold text-xs text-[#181c1c] dark:text-white uppercase">
            Account-wise Collections Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(bankAccounts || []).map((acc) => {
              const collected = accountTotalsMap.get(acc.id) || 0;
              return (
                <div
                  key={acc.id}
                  className="bg-[#f7faf9] dark:bg-neutral-800/80 p-3 rounded-xl border border-[#e0e3e2] dark:border-neutral-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center text-[#98001b] shadow-xs">
                      {acc.methodType === 'bank' && <Building2 className="w-4 h-4 text-blue-600" />}
                      {acc.methodType === 'jazzcash' && <Smartphone className="w-4 h-4 text-red-600" />}
                      {acc.methodType === 'easypaisa' && <Smartphone className="w-4 h-4 text-emerald-600" />}
                      {acc.methodType === 'cash' && <DollarSign className="w-4 h-4 text-[#775a19]" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#181c1c] dark:text-white">
                        {acc.title}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500">
                        {acc.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-['Montserrat'] font-black text-xs text-emerald-600 dark:text-emerald-400 block">
                      PKR {collected.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase">PAID</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statement Ledger Table */}
      <div className="bg-white dark:bg-[#2d3131] rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs overflow-hidden">
        {/* Statement Printable Header */}
        <div className="p-4 bg-[#181c1c] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#fed488] uppercase tracking-wider block">
              OFFICIAL ACCOUNT STATEMENT &bull; APNI SAWARI SCHEME
            </span>
            <h4 className="font-['Montserrat'] font-black text-base text-white">
              {statementMode === 'specific' && selectedAccount
                ? `${selectedAccount.title} Statement (${selectedAccount.accountNumber})`
                : 'All Accounts Consolidated General Statement'}
            </h4>
          </div>
          <div className="text-left sm:text-right text-xs text-neutral-300 font-mono">
            <span>Generated: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 font-urdu space-y-1">
            <p className="text-sm font-bold">    </p>
            <p className="text-xs">         </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f1f4f3] dark:bg-neutral-800 border-b border-[#e0e3e2] dark:border-neutral-700 text-[#5b403f] dark:text-neutral-300 font-bold uppercase text-[10px]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Member & Token</th>
                    <th className="p-3">Scheme</th>
                    <th className="p-3">Receiving Account</th>
                    <th className="p-3">Trx Reference</th>
                    <th className="p-3 text-right">Amount (PKR)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e2] dark:divide-neutral-700 font-medium text-neutral-800 dark:text-neutral-200">
                  {paginatedPayments.map((p) => (
                    <StatementRow key={p.id} payment={p} onViewSlip={onViewSlip} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f7faf9] dark:bg-neutral-800 border-t-2 border-[#98001b] font-bold text-xs">
                    <td colSpan={5} className="p-3 text-right uppercase text-neutral-700 dark:text-neutral-300">
                      Grand Total Statement Amount:
                    </td>
                    <td className="p-3 text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                      PKR {totalVerifiedPaid.toLocaleString()}
                    </td>
                    <td colSpan={2} className="p-3 text-center text-[10px] text-neutral-500">
                      {filteredPayments.filter((p) => p.status === 'PAID').length} Paid Slips
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredPayments.length > pageSize && (
              <div className="p-3.5 bg-[#f7faf9] dark:bg-neutral-800/80 border-t border-[#e0e3e2] dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-neutral-500 dark:text-neutral-400 font-medium">
                  Showing <strong className="text-[#181c1c] dark:text-white font-mono">{(effectivePage - 1) * pageSize + 1}</strong> to{' '}
                  <strong className="text-[#181c1c] dark:text-white font-mono">
                    {Math.min(effectivePage * pageSize, filteredPayments.length)}
                  </strong>{' '}
                  of <strong className="text-[#181c1c] dark:text-white font-mono">{filteredPayments.length}</strong> transactions
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={effectivePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[#e0e3e2] dark:border-neutral-700 bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono font-bold px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                    Page {effectivePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={effectivePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[#e0e3e2] dark:border-neutral-700 bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
