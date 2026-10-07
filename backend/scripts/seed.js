const db = require("../src/config/db");

const agents = [
  ["Ravi Kumar", "ravi.kumar@example.test", "+919900000001", "Koramangala", "active"],
  ["Ananya Rao", "ananya.rao@example.test", "+919900000002", "Indiranagar", "active"],
  ["Arjun Nair", "arjun.nair@example.test", "+919900000003", "Whitefield", "inactive"],
  ["Meera Shah", "meera.shah@example.test", "+919900000004", "HSR Layout", "active"],
  ["Kiran Patel", "kiran.patel@example.test", "+919900000005", "Koramangala", "inactive"],
  ["Divya Menon", "divya.menon@example.test", "+919900000006", "Indiranagar", "active"],
  ["Vikram Das", "vikram.das@example.test", "+919900000007", "Whitefield", "active"],
  ["Neha Reddy", "neha.reddy@example.test", "+919900000008", "HSR Layout", "inactive"],
  ["Sanjay Iyer", "sanjay.iyer@example.test", "+919900000009", "Koramangala", "active"],
  ["Pooja Singh", "pooja.singh@example.test", "+919900000010", "Indiranagar", "inactive"],
  ["Rohan Verma", "rohan.verma@example.test", "+919900000011", "Whitefield", "active"],
  ["Aisha Khan", "aisha.khan@example.test", "+919900000012", "HSR Layout", "active"],
  ["Dev Malhotra", "dev.malhotra@example.test", "+919900000013", "Koramangala", "inactive"],
  ["Isha Gupta", "isha.gupta@example.test", "+919900000014", "Indiranagar", "active"],
  ["Manoj Bhat", "manoj.bhat@example.test", "+919900000015", "Whitefield", "inactive"],
  ["Sara Joseph", "sara.joseph@example.test", "+919900000016", "HSR Layout", "active"],
  ["Nikhil Bose", "nikhil.bose@example.test", "+919900000017", "Koramangala", "active"],
  ["Tara Shetty", "tara.shetty@example.test", "+919900000018", "Indiranagar", "inactive"],
  ["Kabir Jain", "kabir.jain@example.test", "+919900000019", "Whitefield", "active"],
  ["Ravi Narayan", "ravi.narayan@example.test", "+919900000020", "HSR Layout", "inactive"],
  ["Leela Krishnan", "leela.krishnan@example.test", "+919900000021", "Koramangala", "active"],
  ["Aditya Roy", "aditya.roy@example.test", "+919900000022", "Indiranagar", "active"],
  ["Maya Fernandes", "maya.fernandes@example.test", "+919900000023", "Whitefield", "inactive"],
  ["Ravi 50% Kumar", "ravi.percent@example.test", "+919900000024", "HSR Layout", "active"],
  ["Omar Farooq", "ravi.contact@example.test", "+919900000025", "Koramangala", "inactive"],
  ["Nandini Sen", "nandini.sen@example.test", "+919900000026", "Indiranagar", "active"],
  ["Rahul Sood", "rahul.sood@example.test", "+919900000027", "Whitefield", "active"],
  ["Priya Ramesh", "priya.ramesh@example.test", "+919900000028", "HSR Layout", "inactive"],
  ["Sameer Kulkarni", "sameer.kulkarni@example.test", "+919900000029", "Koramangala", "active"],
  ["Zoya Mirza", "zoya.mirza@example.test", "+919900000030", "Indiranagar", "inactive"]
];

async function main() {
  let inserted = 0;
  try {
    for (const [fullName, email, phone, serviceArea, status] of agents) {
      const result = await db.query(
        `INSERT INTO agents (full_name, email, phone, service_area, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [fullName, email, phone, serviceArea, status]
      );
      inserted += result.rowCount;
    }
    console.log(`Seed complete: inserted ${inserted} of ${agents.length} agents.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await db.closeDB();
    } catch (error) {
      console.error("Failed to close database pool:", error);
      process.exitCode = 1;
    }
  }
}

main();
