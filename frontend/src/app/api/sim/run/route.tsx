import PocketBase from "pocketbase";
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { getAuthenticatedUser } from "@/lib/auth";
const execute = promisify(execFile);

const jsonString = '{"days":2,"CustomersPerHour":10,"products":[{"id":1,"name":"apple","price":90,"categoryID":2},{"id":2,"name":"orange","price":100,"categoryID":2},{"id":3,"name":"milk","price":150,"categoryID":2},{"id":4,"name":"pork","price":250,"categoryID":2},{"id":5,"name":"beef","price":300,"categoryID":2},{"id":6,"name":"tea","price":120,"categoryID":2},{"id":7,"name":"coffee","price":140,"categoryID":2}],"customers":[{"id":1,"name":"man","frequency":0.4,"impulsivity":0.3,"patience":40,"interests":{"1":0.1,"2":0.2,"3":0.7,"4":0.5,"5":0.6,"6":0.3,"7":0.2}},{"id":2,"name":"woman","frequency":0.6,"impulsivity":0.1,"patience":100,"interests":{"1":0.3,"2":0.5,"3":0.5,"4":0.7,"5":0.5,"6":0.4,"7":0.4}}],"checkouts":[{"id":1,"capacity":10,"humanCost":100,"technicalCost":100},{"id":2,"capacity":10,"humanCost":100,"technicalCost":100},{"id":3,"capacity":10,"humanCost":100,"technicalCost":100}],"calendar":{"deviations":{"0":{"1":0},"1":{"1":0,"4":0.9,"6":0.6}}}}'

export async function POST(req: NextRequest) {

    const pb = new PocketBase("http://127.0.0.1:8090/");
    await pb.collection("_superusers").authWithPassword("admin@admin.com", "adminadmin");

    const binaryPath = path.resolve(process.cwd(), "src/lib/SimulationEngine");
    const args: string[] = [jsonString];

    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({error: "Credentials were not provided"}, {status: 403});

    try {
        const { stdout } = await execute(binaryPath, args);

        try {
            const newRecord = await pb.collection("SimData").create({
                user: user.id,
                data: stdout,
            });
    
            return NextResponse.json({created: newRecord}, {status: 201});
        } catch (error: any) {
            console.error("Error creating record:", error);
            return NextResponse.json({error: error.message}, {status: 500});
        }
    } catch (error: any) {
        console.error("Execution failed:", error.message);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}