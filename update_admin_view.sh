sed -i "s/'approvals' | 'overview' | 'projects'/'ledger' | 'approvals' | 'overview' | 'projects'/g" src/views/AdminView.tsx

sed -i '/{activeSection === '"'"'approvals'"'"' && (/i\
      {/* ========================================================= */}\
      {activeSection === '"'"'ledger'"'"' && (\
        <AdminTokenLedgerSection\
          activeProjects={activeProjects}\
          users={users}\
          projects={projects}\
          payments={payments}\
        />\
      )}\
' src/views/AdminView.tsx
