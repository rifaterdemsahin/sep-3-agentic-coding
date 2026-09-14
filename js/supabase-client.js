(function(){
  var SUPABASE_URL = 'https://mdsykpdkdprtmkccukle.supabase.co';
  // Anon/public key — safe to ship client-side; access is enforced by
  // Row Level Security policies (see supabase/schema.sql).
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc3lrcGRrZHBydG1rY2N1a2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTcxMTQsImV4cCI6MjEwNDUzMzExNH0.rEzskwh9lenhyru8N0GOa_u192d4QFMTL714FpoeMBE';

  if(!window.supabase || !window.supabase.createClient){
    console.error('Supabase JS library failed to load; falling back is not implemented.');
    return;
  }
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
