import { getToken } from "@/lib/functions";
import { User } from "@/models/User";
import { cookies } from "next/headers";

const BannedPage = async () => {
    const cookie = await cookies();
    const data = await getToken(String(cookie.get("authorization")?.value));
    const session: User = (data.account);
    return (
      <div className="flex w-screen h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">Account Banned</h1>
          <p className="mt-4 text-gray-700">
            Your account has been banned due to a violation of our terms of service.
          </p>
          <p className="mt-4 text-gray-700">
            Banned Reason: {session?.banned_data.reason}
          </p>
          <p className="mt-2 text-gray-600">
            If you believe this is a mistake, please contact support at{" "}
            <a href="mailto:fuckyou@nigger.com" className="text-blue-600 underline">
              fuckyou@nigger.com
            </a>.
          </p>
        </div>
      </div>
    );
  };
  
export default BannedPage;
  