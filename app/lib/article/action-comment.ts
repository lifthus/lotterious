"use server";

import { getCodeFromSlug } from "@/app/lib/article/slug";
import { pg } from "@/db/pool";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const FormSchema = z.object({
  code: z.string(),
  nickname: z
    .string({ invalid_type_error: "닉네임을 입력해주세요." })
    .min(1, { message: "닉네임은 한 글자 이상이어야 해요." })
    .max(10, { message: "닉네임은 10글자 이하로 해주세요." }),
  password: z
    .string({ invalid_type_error: "비밀번호를 입력해주세요." })
    .min(1, { message: "비밀번호는 한 글자 이상이어야 해요." })
    .max(100, { message: "비밀번호는 100글자 이하로 해주세요." }),
  content: z
    .string({ invalid_type_error: "내용을 입력해주세요." })
    .min(1, { message: "내용은 한 글자 이상이어야 해요." })
    .max(250, { message: "내용은 250글자 이하로 해주세요." }),
  createdAt: z.string(),
});

export type State = {
  errors?: {
    nickname?: string[];
    password?: string[];
    content?: string[];
  };
  message?: string | null;
};

const CreateComment = FormSchema.omit({ createdAt: true });

export async function createComment(
  state: State,
  formData: FormData
): Promise<State> {
  const validatedForm = CreateComment.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedForm.success)
    return { errors: validatedForm.error.flatten().fieldErrors };

  const { code, nickname, password, content } = validatedForm.data;

  try {
    const artcData = await pg.query(
      `SELECT id, title FROM articles WHERE code = $1`,
      [code]
    );
    const artcId = artcData.rows[0].id;

    const ipAddr = headers().get("x-forwarded-for");

    await pg.query(
      `
  INSERT INTO article_comments (article, content, created_at, author_nickname, author_password, author_ip_addr)
  VALUES ($1, $2, $3, $4, $5, $6)
  `,
      [artcId, content, new Date(), nickname, password, ipAddr]
    );

    const title = encodeURIComponent(artcData.rows[0].title);

    revalidatePath(`/lotto645/article/${title}code${code}`);
    redirect(`/lotto645/article/${title}code${code}`);
  } catch (e) {
    return { message: "댓글 작성 실패" };
  }
}

export async function deleteComment(formData: FormData) {
  const {
    id,
    password,
    redirect: redirectURL,
  } = Object.fromEntries(formData.entries());
  try {
    const commData = await pg.query(
      `
      SELECT article_comments.author_password
      FROM article_comments
      WHERE article_comments.id=$1
      `,
      [id]
    );
    const comm = commData.rows[0];

    if (comm.author_password !== password) {
      return { message: "비밀번호가 일치하지 않습니다." };
    }

    await pg.query(`DELETE FROM article_comments WHERE id=$1`, [id]);
  } catch (e) {
    return { message: "댓글 삭제 실패" };
  }
  revalidatePath(redirectURL.toString());
  redirect(redirectURL.toString());
}
