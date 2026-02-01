// @ts-nocheck
import { db } from "../src/lib/db.ts";

async function findAndDelete() {
    const student = await db.student.findFirst({
        where: { name: "Lydia Ooi Lin Ya" }
    });

    if (!student) {
        console.log("Student not found");
        return;
    }

    console.log(`Found student: ${student.name} (${student.id})`);

    const payments = await db.payment.findMany({
        where: {
            studentId: student.id
        }
    });

    console.log(`Found ${payments.length} payments total`);

    if (payments.length === 0) {
        console.log("No payments found for this student.");
    } else if (payments.length === 1) {
        const p = payments[0];
        console.log(`Deleting single payment: ID=${p.id}, Amount=${p.amount}, Method=${p.method}, Status=${p.status}`);
        await db.payment.delete({ where: { id: p.id } });
        console.log("Payment deleted successfully.");

        // Also check if there's a linked student package and delete it if needed, 
        // essentially mimicking the deletePayment action but simplified for this script.
        // For safety, we just delete the payment row here as requested.
    } else {
        console.log("Multiple payments found. Please specify which one to delete:");
        payments.forEach(p => {
            console.log(`- ID=${p.id}, Amount=${p.amount}, Method=${p.method}, Status=${p.status}, Date=${p.date}`);
        });
    }
}

findAndDelete()
    .catch(console.error)
    .finally(() => process.exit());
