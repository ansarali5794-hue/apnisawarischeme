import React from 'react';
import { UserProfile, UserActiveProject, VehicleProject } from '../types';
import { getNextUniqueTokenNumber } from '../lib/tokenService';
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';

interface AdminApprovalsSectionProps {
  activeProjects?: UserActiveProject[];
  projects?: VehicleProject[];
  onUpdateActiveProject?: (act: UserActiveProject) => void;
  onDeleteActiveProject?: (actId: string) => void;
  users: UserProfile[];
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  currentLang: string;
}

export const AdminApprovalsSection: React.FC<AdminApprovalsSectionProps> = ({ users, onUpdateUser, onDeleteUser, currentLang, activeProjects = [], projects = [], onUpdateActiveProject, onDeleteActiveProject }) => {
  
  const pendingUsers = (users || []).filter(u => u.account_status === 'pending');
  const passwordResetUsers = (users || []).filter(u => u.resetPasswordRequested === true);
  const pendingEnrollments = (activeProjects || []).filter(p => p.status === 'PENDING');

  const handleApproveEnrollment = async (enroll: UserActiveProject) => {
    if (!onUpdateActiveProject) {
      alert('Error: Active projects update handler is not available.');
      return;
    }
    try {
      let finalTicket = enroll.ticketNumber;
      if (!finalTicket || finalTicket.includes('PENDING')) {
        const project = (projects || []).find(p => p.id === enroll.projectId);
        const tokenResult = await getNextUniqueTokenNumber(enroll.projectId, activeProjects, project?.startDate);
        finalTicket = tokenResult.tokenDisplay;
      }
      const updatedEnroll: UserActiveProject = {
        ...enroll,
        status: 'ACTIVE',
        ticketNumber: finalTicket,
        userToken: finalTicket,
        completedUnits: Math.max(1, enroll.completedUnits || 0)
      };
      onUpdateActiveProject(updatedEnroll);
      alert(`Token ${finalTicket} activated successfully for ${enroll.userName}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to activate token');
    }
  };

  const handleRejectEnrollment = (enroll: UserActiveProject) => {
    if (confirm('Are you sure you want to reject this enrollment?')) {
      if (onDeleteActiveProject) onDeleteActiveProject(enroll.id);
    }
  };


  const t = {
    title: currentLang === 'sd' ? 'منظوري جي قطار (Approvals Queue)' : currentLang === 'ur' ? 'منظوری کی قطار (Approvals Queue)' : 'Approvals Queue',
    noPending: currentLang === 'sd' ? 'ڪا به نئين درخواست التوا ۾ ناهي (تمام منظور ٿيل آهن)' : currentLang === 'ur' ? 'کوئی نئی درخواست زیر التواء نہیں ہے (تمام درخواستیں منظور ہیں)' : 'No pending requests in queue',
    pendingRegs: currentLang === 'sd' ? 'نئين رڪنيت جون درخواستون' : currentLang === 'ur' ? 'نئے ممبرز کی رجسٹریشن درخواستیں' : 'New Member Registrations',
    passResets: currentLang === 'sd' ? 'پاس ورڊ ري سيٽ درخواستون' : currentLang === 'ur' ? 'پاس ورڈ ری سیٹ کی درخواستیں' : 'Password Reset Requests',
  };

  const handleApproveRegistration = (user: UserProfile) => {
    onUpdateUser({ ...user, account_status: 'active' });
  };

  const handleRejectRegistration = (user: UserProfile) => {
    if (confirm('Are you sure you want to reject and delete this registration request?')) {
      onDeleteUser(user.id || user.uid || '');
    }
  };

  const handleApprovePasswordReset = (user: UserProfile) => {
    if (user.pendingNewPassword) {
      onUpdateUser({ 
        ...user, 
        password: user.pendingNewPassword, 
        resetPasswordRequested: false,
        resetPasswordRequestedAt: undefined,
        pendingNewPassword: undefined
      });
      alert(`Password updated for ${user.name}.`);
    } else {
      alert('No new password was requested.');
    }
  };

  const handleRejectPasswordReset = (user: UserProfile) => {
    if (confirm('Are you sure you want to reject this password reset request?')) {
      onUpdateUser({ 
        ...user, 
        resetPasswordRequested: false,
        resetPasswordRequestedAt: undefined
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-headline font-bold text-lg text-[#181c1c] dark:text-white uppercase flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        {t.title}
      </h3>

      {pendingUsers.length === 0 && passwordResetUsers.length === 0 && pendingEnrollments.length === 0 && (
        <div className="bg-white dark:bg-[#2d3131] p-8 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 text-center text-neutral-500">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-50" />
          <p>{t.noPending}</p>
        </div>
      )}

      {pendingUsers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-[#181c1c] dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">{t.pendingRegs} ({pendingUsers.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingUsers.map(user => (
              <div key={user.uid || user.id} className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-[#181c1c] dark:text-white text-lg mb-1">{user.name}</h5>
                    <div className="space-y-1.5 mt-3">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                        <span className="text-neutral-400 text-xs uppercase font-bold">Mobile</span>
                        <a href={`tel:${user.phone || user.phoneNumber}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                          {user.phone || user.phoneNumber}
                        </a>
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                        <span className="text-neutral-400 text-xs uppercase font-bold">CNIC</span>
                        <span className="font-mono text-[#181c1c] dark:text-white font-medium">{user.cnic}</span>
                      </p>
                      <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-0.5">Full Address</span>
                        <p className="text-xs text-[#181c1c] dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                          {user.address}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full font-bold h-fit shrink-0">Pending</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-amber-100 dark:border-amber-900/30">
                  <button onClick={() => handleApproveRegistration(user)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleRejectRegistration(user)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {pendingEnrollments.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="font-bold text-[#181c1c] dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">
            {currentLang === 'ur' ? 'سکیم میں شرکت اور نئے ٹوکن کی منظوری' : currentLang === 'sd' ? 'اسڪيم شرڪت ۽ نئين ٽوڪن منظوري' : 'Scheme Enrollments & Token Approvals'} ({pendingEnrollments.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingEnrollments.map(enroll => {
              const member = (users || []).find(
                u => u.id === enroll.userId || u.uid === enroll.userId || u.memberId === enroll.userId || (u.name && enroll.userName && u.name.trim().toLowerCase() === enroll.userName.trim().toLowerCase())
              );
              const matchedProj = (projects || []).find(p => p.id === enroll.projectId || p.title === enroll.projectTitle);
              const isOneTime = matchedProj?.projectType === 'one-time' || enroll.projectType?.toLowerCase().includes('one-time') || enroll.projectType?.toLowerCase().includes('lucky');

              return (
                <div key={enroll.id} className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-[#181c1c] dark:text-white text-base">{enroll.userName}</h5>
                        {member?.memberId && (
                          <span className="text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded">
                            {member.memberId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">{enroll.projectTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md">
                          Token: {enroll.ticketNumber || 'Pending'}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500">
                          {isOneTime ? 'One-Time Lucky Draw' : enroll.projectType}
                        </span>
                      </div>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded-full font-bold">Pending Approval</span>
                  </div>

                  {/* Customer Contact & Personal Details */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold">Mobile Phone</span>
                      <a href={`tel:${member?.phone || member?.phoneNumber || ''}`} className="text-blue-600 font-bold hover:underline">
                        {member?.phone || member?.phoneNumber || 'Not provided'}
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-[10px] uppercase font-bold">CNIC Number</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">{member?.cnic || 'Not provided'}</span>
                    </div>
                    {member?.address && (
                      <div className="pt-1 border-t border-neutral-200/50 dark:border-neutral-700/50">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-0.5">Address</span>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">{member.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button onClick={() => handleApproveEnrollment(enroll)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1 cursor-pointer transition-colors shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> Approve & Activate Token
                    </button>
                    <button onClick={() => handleRejectEnrollment(enroll)} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1 cursor-pointer transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {passwordResetUsers.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="font-bold text-[#181c1c] dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">{t.passResets} ({passwordResetUsers.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {passwordResetUsers.map(user => (
              <div key={user.uid || user.id} className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-[#181c1c] dark:text-white">{user.name}</h5>
                    <p className="text-xs text-neutral-500">{user.phone || user.phoneNumber}</p>
                    <p className="text-xs text-neutral-500">CNIC: {user.cnic}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <RefreshCcw className="w-3 h-3" /> Reset Req
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleApprovePasswordReset(user)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleRejectPasswordReset(user)} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
