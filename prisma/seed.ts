import { PrismaClient, Role, Priority, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old test data...");
  await prisma.grievanceHistory.deleteMany();
  await prisma.grievance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.contactEnquiry.deleteMany();

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  console.log("Seeding Kerala Departments...");
  const pwd = await prisma.department.create({
    data: {
      name: "Public Works Department (PWD)",
      code: "PWD",
      description: "State roads, bridges, and public infrastructure construction and maintenance."
    }
  });

  const health = await prisma.department.create({
    data: {
      name: "Health & Family Welfare",
      code: "HEALTH",
      description: "Government medical colleges, district hospitals, primary healthcare and public health surveillance."
    }
  });

  const revenue = await prisma.department.create({
    data: {
      name: "Revenue & Land Records",
      code: "REVENUE",
      description: "Land resurvey, title deeds (pattayam), disaster relief administration, and taluk services."
    }
  });

  const lsg = await prisma.department.create({
    data: {
      name: "Local Self Government (LSGD)",
      code: "LSGD",
      description: "Panchayats, municipalities, corporations, waste management, and building permits."
    }
  });

  console.log("Seeding Demo Users...");
  // 1. Citizen
  const citizen = await prisma.user.create({
    data: {
      name: "Arun Kumar",
      email: "citizen@kerala.gov.in",
      mobile: "9847012345",
      password: hashedPassword,
      role: Role.CITIZEN
    }
  });

  // 2. CMO Administrator
  const cmoAdmin = await prisma.user.create({
    data: {
      name: "Dr. K. S. Radhakrishnan (IAS - CMO)",
      email: "cmo@kerala.gov.in",
      mobile: "9447000001",
      password: hashedPassword,
      role: Role.CMO_ADMIN
    }
  });

  // 3. PWD Department Officer
  const pwdOfficer = await prisma.user.create({
    data: {
      name: "Er. Suresh Babu (EE PWD Roads)",
      email: "pwd.officer@kerala.gov.in",
      mobile: "9447111222",
      password: hashedPassword,
      role: Role.OFFICER,
      departmentId: pwd.id
    }
  });

  console.log("Seeding Initial Grievance with Full Lifecycle Trace...");
  const sampleGrievance = await prisma.grievance.create({
    data: {
      trackingId: "KL-2026-PWD-001",
      citizenId: citizen.id,
      district: "Kozhikode",
      category: "Roads & Bridges",
      subject: "Severe potholes on Mavoor Road causing frequent two-wheeler accidents",
      description: "The 2km stretch between Calicut Medical College and Mavoor is full of deep craters due to monsoon damage. Commuters and ambulances are severely delayed.",
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      departmentId: pwd.id,
      aiSummary: "Hazardous potholes on Mavoor Road hindering emergency vehicles and causing accidents. Immediate resurfacing required.",
      aiSuggestedDept: "Public Works Department (PWD)",
      aiSuggestedPriority: Priority.HIGH,
      cmoRemarks: "Forwarded with Priority 1. Executive Engineer to conduct physical inspection and initiate patch work within 48 hours."
    }
  });

  // Audit Log
  await prisma.grievanceHistory.createMany({
    data: [
      {
        grievanceId: sampleGrievance.id,
        actionById: citizen.id,
        fromStatus: Status.SUBMITTED,
        toStatus: Status.SUBMITTED,
        remarks: "Grievance submitted by citizen via portal."
      },
      {
        grievanceId: sampleGrievance.id,
        actionById: cmoAdmin.id,
        fromStatus: Status.SUBMITTED,
        toStatus: Status.UNDER_REVIEW,
        remarks: "CMO verified AI classification and marked High priority."
      },
      {
        grievanceId: sampleGrievance.id,
        actionById: cmoAdmin.id,
        fromStatus: Status.UNDER_REVIEW,
        toStatus: Status.IN_PROGRESS,
        remarks: "Forwarded to PWD Executive Engineer, Kozhikode Division for field inspection."
      }
    ]
  });

  console.log("Seeding Complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});