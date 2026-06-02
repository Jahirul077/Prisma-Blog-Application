import { prisma } from "@/lib/prisma";
import { UserRole } from "@/middlewares/auth";

async function seedAdmin() {
  try {

    console.log("admin Seedind started!");
    // check if admin exists

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables",
      );
    }

    const adminData = {
      name: "Admin",
      email,
      password,
      role: UserRole.ADMIN,
      emailVerified: true,
    };

    console.log("************ checking Admin Exist or Not")
    // check if user already exist
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingAdmin) {
      throw new Error("User already exists");
    }

    // Admin create----
    const signUpAdmin = await fetch(
      "http://localhost:3001/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:4000",
        },
        body: JSON.stringify(adminData),
      },
    );

    //email verified false
    
    //
    if (signUpAdmin.ok) {
        console.log("****** Admin created successfully ",signUpAdmin);
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}

seedAdmin();
