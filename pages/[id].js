import supabase from "../utils/supabase"


export default function PostPage({ post }) {
  return (
    <div>
      <h1>{post.headline}</h1>
      <p>{post.content}</p>
      <pre>{JSON.stringify(post, null, 2)}</pre>
    </div>
  )
}

export async function getServerSideProps( { params }) {
  const { data: post, error } = await supabase
  .from('posts')
  .select('*, comments(*)')
  .eq('id', params.id)
  .single()
  
  if (error) {
    throw new Error(error.message)
  }

  return {
    props: {
      post,
    }
  }
}