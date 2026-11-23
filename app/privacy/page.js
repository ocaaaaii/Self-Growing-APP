import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";

export const metadata = { title: "隱私權政策" };

export default function PrivacyPage() {
  return (
    <LegalPage title="隱私權政策" updated="2026 年 11 月 23 日">
      <p>
        「Mochi 慢慢變好」（以下稱本服務）是一個幫你養成習慣的網頁 App。這份說明告訴你本服務會收集哪些資料、怎麼使用，以及你可以怎麼刪除。
      </p>

      <Section title="我們收集的資料">
        <ul className="list-disc space-y-1 pl-5">
          <li>帳號資料：Email、暱稱、語言與主題設定。</li>
          <li>使用 Google 登入時：Google 提供的 Email、名字與大頭貼網址。我們只要求 email 與基本個人資料（profile）權限，不會讀取你的 Gmail、雲端硬碟或其他 Google 資料。</li>
          <li>你在 App 裡建立的內容：習慣與打卡紀錄、規則、獎勵與兌換紀錄、復盤、感恩、請假、每週回顧。</li>
          <li>兌換獎勵時你選擇上傳的照片與備註。</li>
          <li>你透過意見回饋表單送出的內容，以及你選擇留下的回覆 Email。</li>
        </ul>
      </Section>

      <Section title="資料的用途">
        <p>
          這些資料只用來提供 App 的功能，例如顯示你的清單、計算點數與成長紀錄。我們不販售你的資料，不放廣告，也沒有使用第三方追蹤或分析工具。
        </p>
      </Section>

      <Section title="會接觸到資料的服務">
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase：存放帳號、App 內容與兌換照片，並處理登入。</li>
          <li>Vercel：託管網站。</li>
          <li>Google：只在你選擇用 Google 登入時，用來確認你的身分。</li>
          <li>
            Anthropic（Claude）：產生 Mochi 的鼓勵話與兌換留言。產生鼓勵話時會送出暱稱、目前點數、今天完成的件數與連續天數；兌換留言會送出你上傳的照片、獎勵名稱與備註。
          </li>
        </ul>
      </Section>

      <Section title="兌換照片">
        <p>
          兌換照片存放在可以用網址讀取的位置，知道網址的人就能看到。請不要上傳你不希望被別人看到的照片。
        </p>
      </Section>

      <Section title="瀏覽器裡的資料">
        <p>本服務用 cookie 保持你的登入狀態，並把語言設定存在瀏覽器（localStorage）。</p>
      </Section>

      <Section title="保存與刪除">
        <p>
          資料會保存到你刪除為止。在 App 裡刪除習慣或獎勵時，相關的打卡與兌換紀錄會一起刪除。想刪除整個帳號與所有資料，請透過<Link href="/feedback" className="font-semibold text-accent underline underline-offset-4">意見回饋表單</Link>，類型選「帳號與隱私」，我們收到後會處理。
        </p>
      </Section>

      <Section title="政策更新">
        <p>這份政策如有修改，會更新本頁與上方的日期。</p>
      </Section>

      <Section title="聯絡我們">
        <p>對隱私有任何問題，請透過<Link href="/feedback" className="font-semibold text-accent underline underline-offset-4">意見回饋表單</Link>告訴我們。</p>
      </Section>
    </LegalPage>
  );
}
