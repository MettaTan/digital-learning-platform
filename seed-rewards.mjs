import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

async function seedRewards() {
  console.log("Checking if rewards already exist...");
  
  const [existingRewards] = await connection.query("SELECT COUNT(*) as count FROM rewards_catalog");
  
  if (existingRewards[0].count > 0) {
    console.log(`Database already has ${existingRewards[0].count} rewards. Skipping seed.`);
    await connection.end();
    return;
  }

  console.log("Seeding rewards catalog...");

  const rewards = [
    {
      name: "Free Parking Pass (1 Day)",
      description: "Redeem for one day of free parking on campus. Valid for any parking lot.",
      category: "parking",
      creditCost: 50,
      icon: "Car",
      isActive: 1,
    },
    {
      name: "Free Parking Pass (1 Week)",
      description: "Enjoy a full week of free parking on campus. Perfect for busy weeks!",
      category: "parking",
      creditCost: 300,
      icon: "Car",
      isActive: 1,
    },
    {
      name: "Preferred Exam Seating",
      description: "Choose your preferred seat for the next exam. First come, first served!",
      category: "exam_seating",
      creditCost: 100,
      icon: "Armchair",
      isActive: 1,
    },
    {
      name: "Front Row Exam Seat",
      description: "Guarantee a front row seat for your next exam with optimal visibility.",
      category: "exam_seating",
      creditCost: 150,
      icon: "Armchair",
      isActive: 1,
    },
    {
      name: "Study Room Booking (2 Hours)",
      description: "Reserve a private study room for 2 hours. Perfect for group projects!",
      category: "facilities_booking",
      creditCost: 80,
      icon: "DoorOpen",
      isActive: 1,
    },
    {
      name: "Study Room Booking (Full Day)",
      description: "Book a study room for an entire day. Ideal for intensive study sessions.",
      category: "facilities_booking",
      creditCost: 250,
      icon: "DoorOpen",
      isActive: 1,
    },
    {
      name: "Extra Quiz Time (+5 minutes)",
      description: "Get an additional 5 minutes for your next quiz attempt.",
      category: "quiz_time",
      creditCost: 75,
      icon: "Clock",
      isActive: 1,
    },
    {
      name: "Extra Quiz Time (+10 minutes)",
      description: "Receive 10 extra minutes for your next quiz. More time to think!",
      category: "quiz_time",
      creditCost: 120,
      icon: "Clock",
      isActive: 1,
    },
    {
      name: "Participation Points Boost (5%)",
      description: "Add 5% to your participation grade for this semester.",
      category: "participation_points",
      creditCost: 200,
      icon: "TrendingUp",
      isActive: 1,
    },
    {
      name: "Participation Points Boost (10%)",
      description: "Boost your participation grade by 10%. Great for improving your GPA!",
      category: "participation_points",
      creditCost: 350,
      icon: "TrendingUp",
      isActive: 1,
    },
    {
      name: "SkillsFuture Credit ($50)",
      description: "Redeem for $50 SkillsFuture credit to use on approved courses.",
      category: "skillsfuture",
      creditCost: 500,
      icon: "GraduationCap",
      isActive: 1,
    },
    {
      name: "SkillsFuture Credit ($100)",
      description: "Get $100 SkillsFuture credit for professional development courses.",
      category: "skillsfuture",
      creditCost: 900,
      icon: "GraduationCap",
      isActive: 1,
    },
    {
      name: "CulturePass Credit ($20)",
      description: "Enjoy $20 CulturePass credit for arts and cultural activities.",
      category: "culturepass",
      creditCost: 200,
      icon: "Palette",
      isActive: 1,
    },
    {
      name: "CulturePass Credit ($50)",
      description: "Redeem $50 CulturePass credit for museums, concerts, and more!",
      category: "culturepass",
      creditCost: 450,
      icon: "Palette",
      isActive: 1,
    },
    {
      name: "CDC Voucher ($10)",
      description: "Get a $10 CDC voucher to use at participating merchants.",
      category: "cdc_voucher",
      creditCost: 100,
      icon: "Ticket",
      isActive: 1,
    },
    {
      name: "CDC Voucher ($20)",
      description: "Redeem a $20 CDC voucher for groceries and daily essentials.",
      category: "cdc_voucher",
      creditCost: 180,
      icon: "Ticket",
      isActive: 1,
    },
  ];

  for (const reward of rewards) {
    await connection.query(
      `INSERT INTO rewards_catalog (name, description, category, creditCost, icon, isActive) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reward.name, reward.description, reward.category, reward.creditCost, reward.icon, reward.isActive]
    );
  }

  console.log(`✅ Successfully seeded ${rewards.length} rewards`);
  await connection.end();
}

seedRewards().catch((error) => {
  console.error("Error seeding rewards:", error);
  process.exit(1);
});
