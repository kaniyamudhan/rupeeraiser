// import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Download, Lock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { endpoints } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function Profile() {
  const { user, setUser, allTransactions } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || ''
  });

  const [passData, setPassData] = useState({ current: '', new: '' });

  // ✅ PDF Date Range State
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');

  // ✅ Save Profile
  const handleSaveProfile = async () => {
    try {
      await endpoints.updateProfile(formData);
      setUser(prev => ({ ...prev!, ...formData }));
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Failed to update profile");
    }
  };

  // ✅ Change Password
  const handleChangePassword = async () => {
    try {
      await endpoints.changePassword({
        current_password: passData.current,
        new_password: passData.new
      });
      toast.success("Password changed!");
      setPassData({ current: '', new: '' });
    } catch (e) {
      toast.error("Incorrect current password");
    }
  };

  // ✅ ✅ ✅ MONTH-WISE PDF DOWNLOAD ✅ ✅ ✅
  const handleDownloadPDF = () => {
    let filteredData = allTransactions;

    // ✅ Apply Date Filter If Selected
    if (reportStart && reportEnd) {
      const start = new Date(reportStart);
      const end = new Date(reportEnd);
      end.setHours(23, 59, 59);

      filteredData = allTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= start && tDate <= end;
      });
    }

    if (filteredData.length === 0) {
      toast.error("No transactions found in this range");
      return;
    }

    // ✅ Sort by Date (Old → New)
    const sorted = [...filteredData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // ✅ Group By Month (YYYY-MM)
    const groupedByMonth: Record<string, typeof sorted> = {};
    sorted.forEach(tx => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groupedByMonth[key]) groupedByMonth[key] = [];
      groupedByMonth[key].push(tx);
    });

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("RupeeRiser Transaction Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generated for: ${user?.name}`, 14, 22);

    if (reportStart && reportEnd) {
      doc.text(`Period: ${reportStart} to ${reportEnd}`, 14, 27);
    } else {
      doc.text(`Period: All Time`, 14, 27);
    }

    let currentY = 35;

    // ✅ Generate Month-Wise Tables
    Object.entries(groupedByMonth).forEach(([monthKey, monthTxs]) => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(Number(year), Number(month) - 1)
        .toLocaleString('default', { month: 'long' });

      doc.setFontSize(13);
      doc.text(`${monthName} ${year}`, 14, currentY);
      currentY += 5;

      const tableData = monthTxs.map(t => [
        t.date,
        t.note,
        t.category,
        t.account,
        t.type.toUpperCase(),
        `${t.type === 'income' ? '+' : '-'} ${t.amount}`
      ]);

      autoTable(doc, {
        head: [['Date', 'Note', 'Category', 'Account', 'Type', 'Amount']],
        body: tableData,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save(`RupeeRiser_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Month-wise PDF Downloaded Successfully");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 animate-fade-in">

      {/* ✅ Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl">
          {formData.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{formData.name}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* ✅ EXPORT PDF */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-blue-500">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> Export Data
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From Date</Label>
            <Input type="date" value={reportStart} onChange={e => setReportStart(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To Date</Label>
            <Input type="date" value={reportEnd} onChange={e => setReportEnd(e.target.value)} />
          </div>
        </div>

        <Button variant="outline" onClick={handleDownloadPDF} className="w-full rounded-xl">
          <Download className="w-4 h-4 mr-2" /> Download Report PDF
        </Button>
      </div>

      {/* ✅ Personal Details */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Personal Details
        </h3>

        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input value={user?.email} disabled />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /> */}
            <Input
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
          </div>

          <Button onClick={handleSaveProfile} className="w-full gradient-primary">
            Save Changes
          </Button>
        </div>
      </div>

      {/* ✅ Security */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive">
          <Lock className="w-5 h-5" /> Security
        </h3>

        <Input
          type="password"
          placeholder="Current Password"
          value={passData.current}
          onChange={e => setPassData({ ...passData, current: e.target.value })}
        />

        <Input
          type="password"
          placeholder="New Password"
          value={passData.new}
          onChange={e => setPassData({ ...passData, new: e.target.value })}
        />

        <Button variant="destructive" onClick={handleChangePassword} className="w-full">
          Update Password
        </Button>
      </div>
    </div>
  );
}
