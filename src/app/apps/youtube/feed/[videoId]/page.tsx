interface PageProps {
  params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;
  return <div>The video id is {videoId} </div>;
};

export default Page;
