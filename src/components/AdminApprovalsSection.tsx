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
    if (!onUpdateActiveProject) return;
    try {
      // Generate token
      const project = (projects || []).find(p => p.id === enroll.projectId);
      const tokenResult = await getNextUniqueTokenNumber(enroll.projectId, activeProjects, project?.startDate);
      onUpdateActiveProject({
        ...enroll,
        status: 'ACTIVE',
        ticketNumber: tokenResult.tokenDisplay,
        userToken: tokenResult.tokenDisplay
      });
      alert(`Token ${tokenResult.tokenDisplay} assigned successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate token');
    }
  };

  const handleRejectEnrollment = (enroll: UserActiveProject) => {
    if (confirm('Are you sure you want to reject this enrollment?')) {
      if (onDeleteActiveProject) onDeleteActiveProject(enroll.id);
    }
  };


  const t = {
    title: currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Approvals Queue',
    noPending: currentLang === 'sd' ? '    ' : currentLang === 'ur' ? '    ' : 'No pending requests',
    pendingRegs: currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'New Registrations',
    passResets: currentLang === 'sd' ? '    ' : currentLang === 'ur' ? '     ' : 'Password Reset Requests',
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
          <h4 className="font-bold text-[#181c1c] dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">Scheme Enrollments ({pendingEnrollments.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingEnrollments.map(enroll => (
              <div key={enroll.id} className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-[#181c1c] dark:text-white">{enroll.userName}</h5>
                    <p className="text-xs text-neutral-500">{enroll.projectTitle}</p>
                    <p className="text-xs text-[#98001b] font-bold">Request: Token Assignment</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded-full font-bold">Pending</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleApproveEnrollment(enroll)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Approve & Assign Token
                  </button>
                  <button onClick={() => handleRejectEnrollment(enroll)} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
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
