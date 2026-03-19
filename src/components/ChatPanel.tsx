'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  X
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  assessmentResult?: any;
  onClose?: () => void;
}

export default function ChatPanel({ assessmentResult, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [presetQuestions, setPresetQuestions] = useState<{
    category: string;
    questions: string[];
  }[]>([]);
  const [showPresets, setShowPresets] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 加载预设问题
  useEffect(() => {
    fetch('/api/posture-chat')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPresetQuestions(data.data.presetQuestions);
        }
      })
      .catch(console.error);
  }, []);
  
  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // 发送消息
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowPresets(false);
    
    try {
      const response = await fetch('/api/posture-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          assessmentResult,
          history: messages.slice(-10), // 只传最近10条
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.content,
          timestamp: data.data.timestamp,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || '发送失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  // 按回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // 渲染消息内容（支持简单的Markdown）
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // 处理列表
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-muted-foreground">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      
      // 处理数字列表
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-muted-foreground shrink-0">{line.match(/^\d+\./)?.[0]}</span>
            <span>{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      
      // 处理加粗
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <div key={i} className="my-1">
            {parts.map((part, j) => 
              j % 2 === 1 ? (
                <strong key={j} className="font-semibold">{part}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      // 普通文本
      return <div key={i} className="my-1">{line}</div>;
    });
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="py-3 px-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            体态健康顾问
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* 消息列表 */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 && showPresets && (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-4">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>您好！我是体态健康顾问</p>
                <p className="text-sm">您可以点击下方问题快速提问，或直接输入您的问题</p>
              </div>
              
              {/* 预设问题 */}
              {presetQuestions.map((category, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-medium text-sm">{category.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.questions.map((question, j) => (
                      <Button
                        key={j}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => sendMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex gap-3 mb-4 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl p-3' 
                  : 'bg-muted rounded-r-xl rounded-tl-xl p-3'
              }`}>
                <div className="text-sm whitespace-pre-wrap">
                  {renderContent(message.content)}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-r-xl rounded-tl-xl p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* 输入框 */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 快捷提示 */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              <span>可询问：动作要领、改善建议、疼痛原因等</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
