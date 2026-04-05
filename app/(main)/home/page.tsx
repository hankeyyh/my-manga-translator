import { Manrope, Inter } from "next/font/google";

import {
    HomeAccountNav,
    HomeFooter,
    HomeHistorySection,
    type HomeHistoryRecord,
    HomeProfileCard,
    HomeProUpsellCard,
} from "@/components/home";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "700", "800"],
    variable: "--font-manrope",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-inter",
});

const PROFILE_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAcDREvFTqL-a6KKMlfk1MYH8SBNlWiH_D0vtDtEopJPHkwSd_XTPjMiRwaAFHGkzQInGNUF0VxV6kY09_z6SdvvFeSL0uh5nmjMI2nWRtsVztuO6OagUAQ-JbKGEi14oxD8_YksRWjV4gHzJUFC4zAkwi3D6RoU6GH_BuPkEHhUMrOI_DJxw3JN2RwYzSyWkla28vOJPNFAmUDM-1KVzYjPwR-26OQWGy8fce3VNrM1JGrAGevBPNlMu2cBxq4wSX5uFUyWKw";

const historyRecords: HomeHistoryRecord[] = [
    {
        id: 1,
        filename: "Neon_Ghost_Vol1_Ch1.zip",
        size: "24.5 MB",
        language: "JP → EN",
        date: "2024-05-12",
        status: "completed",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC9ATpDHXc2Dc4fGjTJ_9pielutss3f1UGjzRwj2TkBlhCCiyecX6DoVU4k4J5emNklNo2zQm3D7K0D4G4gecdF-EKAMtEp9ygaCLhsBc1fJy_9AjLCk1DZp1ElweqYuZAOQeIMbbEEZrSoKZAH_ulQrE6P-V1Bw99_Xbta5fghiaTH3_J_2bXPLpBQJIQCsaLkKRDnTh8gL7y1xdSJKf5yg_s6riBW4MVaYiTe3C3JV29dqHtGS8_T4-HldozRI-JqQv2sz2k",
    },
    {
        id: 2,
        filename: "Blade_of_Fate_04.pdf",
        size: "12.1 MB",
        language: "KR → EN",
        date: "2024-05-10",
        status: "queued",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDSkq32BqXMVS0OPEoP-6n4DsIWJSeTJqL2M6JjsL0WRGojSIt53k1I_ZKdShrhAr2KUfJO38Kj2nzB4vyGxxd2moazeOrC45TFn1Pt8tGfBjIk6MZyI8TbEmxWVeRVOF4P5Pnlz0bFWuJyJXrRfL9mv4dIkBFzIKddTlx3MiPHuumgsV-88OTWVWbyrvgbR59vExR72wDJGlY6ETuxp7hsuvFR9mUjs7yhxJ-1p9xyYXr3EhZFmwn0fpRyOXEWjiK4I6bkW6E",
    },
    {
        id: 3,
        filename: "Summer_Sketch_S1.zip",
        size: "8.9 MB",
        language: "CN → EN",
        date: "2024-05-08",
        status: "completed",
        image: null,
    },
];

export default function HomePage() {
    return (
        <div
            className={cn(
                manrope.variable,
                inter.variable,
                "min-h-screen bg-[#f8f9fb] font-body text-[#2d3337]",
            )}
        >
            <SiteHeader />

            <main
                className={cn(
                    "mx-auto max-w-7xl px-8 py-12",
                    "pt-16",
                )}
            >
                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    <div className="space-y-8 md:col-span-4 lg:col-span-3">
                        <HomeProfileCard
                            creditsBalance={2450}
                            email="alex.chen@design.com"
                            name="Alex Chen"
                            profileImage={PROFILE_IMAGE}
                            translatedCount={128}
                        />
                        <HomeAccountNav />
                    </div>

                    <div className="space-y-8 md:col-span-8 lg:col-span-9">
                        <HomeProUpsellCard />
                        <HomeHistorySection records={historyRecords} />
                    </div>
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}
