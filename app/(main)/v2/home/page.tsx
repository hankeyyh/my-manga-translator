import { redirect } from "next/navigation";

export default function HomePage() {
    redirect("/v2/home/history");
}
