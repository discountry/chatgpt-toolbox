import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  return (
    <>
      <h1 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
        Chat Room
      </h1>
      <ChatBox />
    </>
  );
};

export default ChatPage;
