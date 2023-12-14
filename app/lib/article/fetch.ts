import { cutIPAddr } from "@/app/lib/article/ip-addr";
import { pg } from "@/db/pool";

export type ArticleOutline = {
  title: string;
  code: string;
  created_at: Date;
  author_nickname: string;
  author_ip_addr: string;
};

export async function fetchArticlesOutline(
  board: string
): Promise<ArticleOutline[]> {
  const res = await pg.query(
    `
    SELECT title, code, created_at, author_nickname, author_ip_addr
    FROM articles
    WHERE board=$1
    ORDER BY created_at DESC;
    `,
    [board]
  );
  return res.rows.map((ol) => {
    let author_ip_addr = ol.author_ip_addr;
    author_ip_addr = cutIPAddr(author_ip_addr);
    return { ...ol, author_ip_addr };
  });
}

export type Article = {
  board: string;
  title: string;
  code: string;
  created_at: Date;
  author_nickname: string;
  author_ip_addr: string;
  content: string;
};

export async function fetchArticleByCode(code: string): Promise<Article> {
  const res = await pg.query(
    `
    SELECT board, title, code, created_at, author_nickname, author_ip_addr, content
    FROM articles
    WHERE code=$1;
    `,
    [code]
  );
  res.rows[0].author_ip_addr = cutIPAddr(res.rows[0].author_ip_addr);
  return res.rows[0];
}

export type Comment = {
  id: number;
  content: string;
  created_at: Date;
  author_nickname: string;
  author_ip_addr: string;
};

export async function fetchComments(code: string): Promise<Comment[]> {
  const artcData = await pg.query(`SELECT id FROM articles WHERE code = $1`, [
    code,
  ]);
  const artcId = artcData.rows[0].id;

  const res = await pg.query(
    `
  SELECT id, content, created_at, author_nickname, author_ip_addr
  FROM article_comments
  WHERE article=$1
  ORDER BY created_at ASC;
  `,
    [artcId]
  );

  return res.rows.map((comment) => {
    return { ...comment, author_ip_addr: cutIPAddr(comment.author_ip_addr) };
  });
}
