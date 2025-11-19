import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, desc, sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

async function testAPI() {
  console.log("🧪 Testing Digital Learning Platform API\n");

  try {
    // Test 1: Check quiz questions exist
    console.log("1️⃣  Testing quiz questions...");
    const [questions] = await connection.query("SELECT COUNT(*) as count FROM quiz_questions");
    console.log(`   ✅ Found ${questions[0].count} quiz questions\n`);

    // Test 2: Create test user
    console.log("2️⃣  Testing user creation...");
    await connection.query(
      "INSERT INTO simple_users (name, credits) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=name",
      ["Test User", 0]
    );
    const [users] = await connection.query("SELECT * FROM simple_users WHERE name = ?", ["Test User"]);
    console.log(`   ✅ User created: ${users[0].name} (ID: ${users[0].id})\n`);

    // Test 3: Get random questions
    console.log("3️⃣  Testing random question selection...");
    const [randomQuestions] = await connection.query(
      "SELECT id, question, category FROM quiz_questions ORDER BY RAND() LIMIT 5"
    );
    console.log(`   ✅ Retrieved ${randomQuestions.length} random questions:`);
    randomQuestions.forEach((q, i) => {
      console.log(`      ${i + 1}. ${q.question.substring(0, 50)}... (${q.category})`);
    });
    console.log();

    // Test 4: Create quiz attempt
    console.log("4️⃣  Testing quiz attempt creation...");
    const [attemptResult] = await connection.query(
      "INSERT INTO quiz_attempts (userId, score, totalQuestions) VALUES (?, ?, ?)",
      [users[0].id, 8, 10]
    );
    const attemptId = attemptResult.insertId;
    console.log(`   ✅ Quiz attempt created (ID: ${attemptId})\n`);

    // Test 5: Save quiz answers
    console.log("5️⃣  Testing quiz answer storage...");
    for (let i = 0; i < 3; i++) {
      await connection.query(
        "INSERT INTO quiz_answers (attemptId, questionId, userAnswer, isCorrect) VALUES (?, ?, ?, ?)",
        [attemptId, randomQuestions[i].id, "A", i % 2]
      );
    }
    const [answers] = await connection.query(
      "SELECT COUNT(*) as count FROM quiz_answers WHERE attemptId = ?",
      [attemptId]
    );
    console.log(`   ✅ Saved ${answers[0].count} quiz answers\n`);

    // Test 6: Update user credits
    console.log("6️⃣  Testing credit system...");
    await connection.query(
      "UPDATE simple_users SET credits = credits + ? WHERE id = ?",
      [80, users[0].id]
    );
    const [updatedUser] = await connection.query(
      "SELECT credits FROM simple_users WHERE id = ?",
      [users[0].id]
    );
    console.log(`   ✅ User credits updated to: ${updatedUser[0].credits}\n`);

    // Test 7: Get leaderboard
    console.log("7️⃣  Testing leaderboard calculation...");
    const [leaderboard] = await connection.query(`
      SELECT 
        su.id as userId,
        su.name,
        su.credits,
        COALESCE(SUM(qa.score), 0) as totalScore,
        COUNT(qa.id) as totalAttempts
      FROM simple_users su
      LEFT JOIN quiz_attempts qa ON su.id = qa.userId
      GROUP BY su.id
      ORDER BY totalScore DESC
      LIMIT 10
    `);
    console.log(`   ✅ Leaderboard retrieved (${leaderboard.length} users):`);
    leaderboard.forEach((entry, i) => {
      console.log(`      ${i + 1}. ${entry.name} - ${entry.totalScore} points (${entry.totalAttempts} attempts)`);
    });
    console.log();

    console.log("✅ All API tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

testAPI();
