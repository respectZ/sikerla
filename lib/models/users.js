const m_users = {
  getDataProfilPekerja: async () => {
    let pekerja = await fetch("api/account");
    pekerja = await pekerja.json();
    return pekerja;
  },
};
