import React from 'react';
import { X, Bell, Award, CreditCard, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Upcoming Lucky Draw: 15th Nov, 2023',
      message: 'Your ticket AS-70-204 is active for the Honda CD70 monthly ballot. Ensure your monthly installment is cleared.',
      time: '2 hours ago',
      type: 'draw',
      actionTab: 'luckydraw',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Payment Reminder (Due in 5 days)',
      message: 'Monthly Kist PKR 5,000 for Honda CD70 committee is due on 10 Nov 2023.',
      time: '1 day ago',
      type: 'payment',
      actionTab: 'payments',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'October Draw Results Published',
      message: 'Congratulations to Ali Raza (AS-145) for winning the October Honda CD70 lucky draw in Shahdadpur!',
      time: '3 weeks ago',
      type: 'result',
      actionTab: 'luckydraw',
      unread: false
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white text-[#181c1c] w-full max-w-md rounded-2xl shadow-2xl border border-[#e0e3e2] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#98001b] text-white px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#fed488]" />
            <h3 className="font-['Montserrat'] font-bold text-base">Scheme Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-[#e0e3e2] max-h-[70vh] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onNavigate(n.actionTab);
                onClose();
              }}
              className={`p-4 hover:bg-[#f7faf9] transition-colors cursor-pointer flex gap-3 ${
                n.unread ? 'bg-[#fff8f8]' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-[#ffdad8] text-[#98001b] flex items-center justify-center shrink-0">
                {n.type === 'draw' ? (
                  <Award className="w-4 h-4" />
                ) : n.type === 'payment' ? (
                  <CreditCard className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-[#181c1c]">{n.title}</h4>
                  <span className="text-[10px] text-[#5b403f]">{n.time}</span>
                </div>
                <p className="text-xs text-[#5b403f] mt-1">{n.message}</p>
                <span className="text-[10px] text-[#98001b] font-bold mt-1 inline-block hover:underline">
                  View details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#ebeeed] text-center border-t border-[#e0e3e2]">
          <p className="text-[11px] text-[#5b403f]">
            Stay updated with real-time draw announcements and verified ledger entries.
          </p>
        </div>
      </div>
    </div>
  );
};
