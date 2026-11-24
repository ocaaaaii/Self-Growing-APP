import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";

export const metadata = { title: "服務條款" };

export default function TermsPage() {
  return (
    <LegalPage title="服務條款" updated="2026 年 11 月 23 日">
      <p>使用「Mochi 慢慢變好」（以下稱本服務），代表你同意以下條款。</p>

      <Section title="服務內容">
        <p>本服務免費提供，協助你記錄習慣、規則、獎勵與每天的反思。服務會依現況提供，我們會盡力維持運作，但不保證永遠不中斷或沒有錯誤。</p>
      </Section>

      <Section title="你的帳號與內容">
        <ul className="list-disc space-y-1 pl-5">
          <li>請保管好你的帳號，帳號下的操作由你負責。</li>
          <li>你建立的內容屬於你。我們只為了提供服務而存放與處理這些內容，詳見<Link href="/privacy" className="text-accent underline underline-offset-4">隱私權政策</Link>。</li>
          <li>請不要上傳違法、侵權，或你沒有權利分享的內容。</li>
        </ul>
      </Section>

      <Section title="使用規範">
        <p>請不要干擾服務運作，例如大量自動化請求、嘗試存取別人的資料，或規避系統的安全機制。違反規範時，我們可能暫停或終止該帳號。</p>
      </Section>

      <Section title="Mochi 的話不是專業建議">
        <p>App 裡的鼓勵話與留言由 AI 產生，目的是陪伴與打氣，不是醫療、心理或其他專業建議。身體或心情需要協助時，請找專業人士。</p>
      </Section>

      <Section title="服務的變更與終止">
        <p>我們可能調整功能，或在事先公告後停止服務。你也可以隨時停止使用，並在「個人設定 › 刪除帳號」刪除帳號與所有資料。</p>
      </Section>

      <Section title="責任限制">
        <p>在法律允許的範圍內，對於因使用或無法使用本服務造成的間接損失，我們不負賠償責任。</p>
      </Section>

      <Section title="條款更新與聯絡">
        <p>條款如有修改，會更新本頁與上方的日期。有任何問題，請透過<Link href="/feedback" className="font-semibold text-accent underline underline-offset-4">意見回饋表單</Link>告訴我們。</p>
      </Section>
    </LegalPage>
  );
}
