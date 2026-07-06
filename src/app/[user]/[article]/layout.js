export async function generateMetadata({ params }) {
  const { user, article } = await params;
  const title = article.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${title} | Plynt.space`,
    description: `Read ${title} by ${user} on Plynt.space`,
  };
}
 export default function PageLayout({children}){
    return <div className="article-layout">
    {children}
    </div>
 }