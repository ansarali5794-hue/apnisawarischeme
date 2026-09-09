sed -i '1990,2018c\
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">\
                    {activeProjects.filter(act => {\
                      const q = memberSearchQuery.toLowerCase();\
                      const matchedUser = users.find(u => u.id === act.userId || u.uid === act.userId);\
                      return (\
                        act.ticketNumber?.toLowerCase().includes(q) || \
                        act.userName?.toLowerCase().includes(q) || \
                        act.projectTitle?.toLowerCase().includes(q) ||\
                        matchedUser?.cnic?.includes(q) || \
                        matchedUser?.phone?.includes(q) || \
                        matchedUser?.phoneNumber?.includes(q)\
                      );\
                    }).map(act => {\
                      const matchedUser = users.find(u => u.id === act.userId || u.uid === act.userId);\
                      return (\
                      <div\
                        key={act.id}\
                        className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer border-b last:border-0 border-neutral-100 dark:border-neutral-700"\
                        onClick={() => {\
                          setPaymentFormData({\
                            ...paymentFormData,\
                            userToken: act.ticketNumber || '',\
                            userName: act.userName || matchedUser?.name || '',\
                            userId: act.userId || '',\
                            projectName: act.projectTitle,\
                            amount: act.monthlyKist || act.tokenAmount || 5000\
                          });\
                          setMemberSearchQuery(`${act.ticketNumber} - ${act.userName}`);\
                          setShowMemberDropdown(false);\
                        }}\
                      >\
                        <div className="font-bold text-sm text-[#181c1c] dark:text-white">\
                          Token: {act.ticketNumber} | {act.userName}\
                        </div>\
                        <div className="text-xs text-neutral-500">\
                          Scheme: {act.projectTitle} {matchedUser ? `| CNIC: ${matchedUser.cnic} | 📞 ${matchedUser.phone || matchedUser.phoneNumber}` : ''}\
                        </div>\
                      </div>\
                    )})}\
                    {users.filter(u => {\
                      const q = memberSearchQuery.toLowerCase();\
                      return (u.name?.toLowerCase().includes(q) || u.cnic?.includes(q) || u.phone?.includes(q) || u.phoneNumber?.includes(q));\
                    }).map(u => {\
                      if (activeProjects.some(act => act.userId === (u.id || u.uid))) return null;\
                      return (\
                      <div\
                        key={u.id}\
                        className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer border-b last:border-0 border-neutral-100 dark:border-neutral-700"\
                        onClick={() => {\
                          setPaymentFormData({\
                            ...paymentFormData,\
                            userToken: u.memberId || '',\
                            userName: u.name || '',\
                            userId: u.id || u.uid || '',\
                          });\
                          setMemberSearchQuery(u.name + \" - \" + (u.cnic || u.phone));\
                          setShowMemberDropdown(false);\
                        }}\
                      >\
                        <div className="font-bold text-sm text-[#181c1c] dark:text-white">{u.name} (No Active Scheme)</div>\
                        <div className="text-xs text-neutral-500">CNIC: {u.cnic} | 📞 {u.phone || u.phoneNumber}</div>\
                      </div>\
                    )})}
' src/views/AdminView.tsx
