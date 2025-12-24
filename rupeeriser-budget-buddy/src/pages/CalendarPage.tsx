import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Button } from '@/components/ui/button';

const CalendarPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-32 animate-fade-in">
      
      {/* HEADER WITH BACK ARROW */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          // onClick={() => navigate(-1)}
          onClick={() => navigate('/dashboard')}
          className="rounded-full md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-2xl font-bold font-display">
          Calendar
        </h1>
      </div>

      <CalendarView />
    </div>
  );
};

export default CalendarPage;
