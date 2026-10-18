import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getStats = async () => {
    const [
        appointmentCount,
        patientCount,
        doctorCount,
        adminCount,
        superAdminCount,
        paymentCount,
        userCount,
        appointments,
        payments
    ] = await Promise.all([
        prisma.appointment.count(),
        prisma.patient.count({ where: { isDeleted: false } }),
        prisma.doctor.count({ where: { isDeleted: false } }),
        prisma.admin.count({ where: { isDeleted: false } }),
        prisma.user.count({ where: { role: Role.SUPER_ADMIN, isDeleted: false } }),
        prisma.payment.count(),
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.appointment.findMany({
            select: {
                status: true,
                createdAt: true,
            }
        }),
        prisma.payment.findMany({
            where: {
                status: PaymentStatus.PAID,
            },
            select: {
                amount: true,
            }
        })
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Calculate appointment status distribution for pie chart
    const statusMap: Record<string, number> = {};
    for (const apt of appointments) {
        statusMap[apt.status] = (statusMap[apt.status] || 0) + 1;
    }
    const pieChartData = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
    }));

    // If no pie chart data, provide defaults
    if (pieChartData.length === 0) {
        pieChartData.push(
            { status: AppointmentStatus.SCHEDULED, count: 0 },
            { status: AppointmentStatus.COMPLETED, count: 0 }
        );
    }

    // Group appointments by month for bar chart
    const monthMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const apt of appointments) {
        const d = new Date(apt.createdAt);
        const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
    }
    const barChartData = Object.entries(monthMap).map(([month, count]) => ({
        month,
        count,
    }));

    if (barChartData.length === 0) {
        const currentMonth = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;
        barChartData.push({ month: currentMonth, count: appointmentCount });
    }

    return {
        appointmentCount,
        patientCount,
        doctorCount,
        adminCount,
        superAdminCount,
        paymentCount,
        userCount,
        totalRevenue,
        barChartData,
        pieChartData,
    };
};

export const StatsService = {
    getStats,
};
