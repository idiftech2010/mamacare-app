import AIChat from '@/components/AIChat';

export default function ChatPage() {
  return (
    <>
      <script>{`
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.getElementById('root').style.height = '100vh';
      `}</script>
      <div style={{ height: 'calc(100vh - 4rem)' }}>
        <AIChat />
      </div>
    </>
  );
}
