import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Lock, Download, FileText, Sun, Moon, Monitor,
  LogOut, Code2, ExternalLink, AlertTriangle, Eye, EyeOff, Info,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const INDIAN_STATES = [
  'Tamil Nadu','Kerala','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar',
  'Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
  'Karnataka','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands',
  'Chandigarh','Dadra and Nagar Haveli','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];

export default function Settings() {
const navigate = useNavigate(); 
  const { user, updateProfile, changePassword, logout, transactions } = useApp();
  const { theme, setTheme } = useTheme();

  const [showPass, setShowPass] = useState(false);

  // Local state for all fields to be stored in MongoDB Atlas
  const [profileData, setProfileData] = useState({
    name: '', phone: '', dob: '', gender: '',
    address: '', city: '', state: '', pincode: '',
  });

  const [passData, setPassData] = useState({ current: '', new: '' });
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  
  const [isPassConfirmOpen, setIsPassConfirmOpen] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const truncateEmail = (email: string | undefined) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length > 12) {
      return `${localPart.substring(0, 8)}...${localPart.slice(-3)}@${domain}`;
    }
    return email;
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      toast.success('Database records updated');
    } catch (err) {
      toast.error('Failed to sync with Atlas');
    }
  };

  const executePasswordChange = async () => {
    setIsUpdatingPass(true);
    try {
      // ✅ Correctly sending plain_text_password along with hashed requirement
      await changePassword({
        current_password: passData.current,
        new_password: passData.new,
        plain_text_password: passData.new, 
      });
      toast.success('Password updated in MongoDB');
      setPassData({ current: '', new: '' });
      setIsPassConfirmOpen(false);
    } catch (err: any) {
      toast.error('Password change failed');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const userName = user?.name || 'User';
    
    let filteredData = transactions;
    let reportTitle = 'Full Financial History';

    if (reportStart && reportEnd) {
      const start = new Date(reportStart);
      const end = new Date(reportEnd);
      end.setHours(23, 59, 59);

      filteredData = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= start && txDate <= end;
      });
      reportTitle = `Statement: ${reportStart} to ${reportEnd}`;
    }

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('RupeeRiser Finance', 14, 20);
    doc.setFontSize(10);
    doc.text(reportTitle, 14, 32);

    doc.setTextColor(0, 0, 0);
    doc.text(`Account Holder: ${userName}`, 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [['Date', 'Note', 'Category', 'Type', 'Account', 'Amount']],
      body: filteredData.map(t => [t.date, t.note || '-', t.category, t.type.toUpperCase(), t.account, `₹${t.amount}`]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`RupeeRiser_Statement.pdf`);
    toast.success('Statement downloaded');
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 space-y-8 px-4 pt-4 animate-fade-in">
 {/* ✅ BACK ARROW HEADER */}
            <div className="flex items-center gap-3 mb-2 md:hidden">
                <Button variant="ghost" size="icon" 
                // onClick={() => navigate(-1)} 
                onClick={() => navigate('/dashboard')}
                className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">Profile & Settings</h1>
            </div>
            
      {/* USER CARD */}
      <div className="flex items-center gap-4 bg-card border p-6 rounded-[32px] overflow-hidden">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{user?.name}</h1>
          <p className="text-muted-foreground truncate">{truncateEmail(user?.email)}</p>
        </div>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="w-full h-14 bg-card border rounded-2xl mb-6">
          <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
          <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
          <TabsTrigger value="app" className="flex-1">App</TabsTrigger>
        </TabsList>

        {/* REPORTS TAB */}
        <TabsContent value="reports">
          <div className="bg-card p-8 rounded-[32px] border space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Export Data
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={reportStart} onChange={e => setReportStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={reportEnd} onChange={e => setReportEnd(e.target.value)} />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm">
                <strong>Note:</strong> Leave dates empty to download your <strong>full transaction history</strong>. Select a range for specific monthly or yearly reports.
              </p>
            </div>

            <Button onClick={generatePDF} className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-bold text-lg">
              <Download className="mr-2" /> 
              {reportStart && reportEnd ? 'Download Period Report' : 'Download Full Statement'}
            </Button>
          </div>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-card p-8 rounded-[32px] border space-y-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Full Name</Label><Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} /></div>
              <div className="space-y-1"><Label>DOB</Label><Input type="date" value={profileData.dob} onChange={e => setProfileData({...profileData, dob: e.target.value})} /></div>
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select value={profileData.gender} onValueChange={val => setProfileData({...profileData, gender: val})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1"><Label>Address</Label><Input value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} /></div>
              <div className="space-y-1"><Label>City</Label><Input value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} /></div>
              <div className="space-y-1">
                <Label>State</Label>
                <Select value={profileData.state} onValueChange={val => setProfileData({...profileData, state: val})}>
                  <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent className="max-h-40">{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Pincode</Label><Input maxLength={6} value={profileData.pincode} onChange={e => setProfileData({...profileData, pincode: e.target.value.replace(/\D/g,'')})} /></div>
            </div>
            <Button onClick={handleProfileUpdate} className="w-full bg-blue-600 h-12 rounded-2xl font-bold">Save All to Atlas</Button>
          </div>

          <div className="bg-card p-8 rounded-[32px] border border-red-100 dark:border-red-900/30 space-y-4">
            <h3 className="font-bold text-xl flex items-center gap-2 text-destructive">
              <Lock className="w-5 h-5" /> Dual-Storage Security
            </h3>
            <div className="relative">
              <Input type={showPass ? "text" : "password"} placeholder="Current Password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} />
            </div>
            <div className="relative">
              <Input type={showPass ? "text" : "password"} placeholder="New Password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-muted-foreground">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <Button variant="destructive" onClick={() => setIsPassConfirmOpen(true)} className="w-full h-12 rounded-2xl font-bold">Update Passwords Everywhere</Button>
          </div>
        </TabsContent>

        {/* APP TAB */}
        <TabsContent value="app">
          <div className="bg-card p-8 rounded-[32px] border space-y-6 text-center">
            <h3 className="font-bold text-xl">Theme Preference</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => setTheme('light')} variant={theme==='light'?'default':'outline'}>Light</Button>
              <Button onClick={() => setTheme('dark')} variant={theme==='dark'?'default':'outline'}>Dark</Button>
              <Button onClick={() => setTheme('system')} variant={theme==='system'?'default':'outline'}>Auto</Button>
            </div>
            {/* RAPTILE DATAWORKS SECTION - Positioned below theme */}
  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[32px] p-6 mt-6 flex justify-between items-center border border-blue-100 dark:border-blue-800">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-xl">
        <Code2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-bold text-blue-900 dark:text-blue-100">Raptile Dataworks</p>
        <p className="text-xs text-blue-700 dark:text-blue-300 opacity-80">Software Development</p>
      </div>
    </div>
    <a 
      href="https://raptiledatawork.vercel.app/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-white dark:bg-blue-800 p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
    >
      <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-200" />
    </a>
  </div>
          </div>
          
          <Button onClick={logout} variant="ghost" className="w-full h-14 text-red-500 mt-6 font-bold"><LogOut className="mr-2" /> Sign Out</Button>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isPassConfirmOpen} onOpenChange={setIsPassConfirmOpen}>
        <AlertDialogContent className="rounded-[32px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> MongoDB Data Update</AlertDialogTitle>
            <AlertDialogDescription>This will update both your hashed password and the plain-text recovery password in Atlas. Proceed?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executePasswordChange} className="bg-destructive text-white rounded-xl">{isUpdatingPass ? "Updating..." : "Yes, Update All"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}