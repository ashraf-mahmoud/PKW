'use server'

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { signOut } from "@/auth"

export async function logout() {
    await signOut({ redirectTo: "/" })
}

const SignUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    phone2: z.string().optional(),
    waiverSigned: z.boolean().refine(val => val === true, "You must sign the waiver"),

    // Optional initial student
    studentName: z.string().optional(),
    studentDob: z.string().optional(),
    studentMedicalInfo: z.string().optional(),
    studentWaiverSigned: z.boolean().optional(),

    role: z.string().default("PARENT")
})

export async function signUp(data: z.infer<typeof SignUpSchema>) {
    try {
        const validated = SignUpSchema.parse(data)

        const existing = await db.user.findUnique({ where: { email: validated.email } })
        if (existing) {
            return { success: false, error: "Email already registered" }
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10)

        // Transaction to create User + Profile + Optional Student
        await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: validated.name,
                    email: validated.email,
                    passwordHash: hashedPassword,
                    role: validated.role,
                    profile: {
                        create: {
                            phone: validated.phone,
                            phone2: validated.phone2,
                            waiverSigned: validated.waiverSigned
                        }
                    }
                }
            })

            // If user added a student during signup
            if (validated.studentName && validated.studentDob) {
                await tx.student.create({
                    data: {
                        parentId: user.id,
                        name: validated.studentName,
                        dob: new Date(validated.studentDob),
                        medicalInfo: validated.studentMedicalInfo,
                        waiverSigned: validated.studentWaiverSigned || false
                    }
                })
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Signup Error:", error)
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message }
        return { success: false, error: "Failed to create account" }
    }
}

export async function forgotPassword(email: string) {
    try {
        const user = await db.user.findUnique({ where: { email } })
        if (!user) {
            // Return success even if not found to prevent enumeration, or return specific error if internal app
            return { success: true, message: "If an account exists, a reset link has been sent." }
        }

        // Simulate sending email
        console.log(`[EMAIL SIMULATION] Password Reset Link for ${email}: /reset-password?email=${encodeURIComponent(email)}&token=simulated-token`)

        return { success: true, message: "Reset link sent to your email." }
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }
}

export async function resetPassword(email: string, newPassword: string, token: string) {
    try {
        // Verify token (simulated)
        if (!token) return { success: false, error: "Invalid token" }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await db.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to reset password" }
    }
}
