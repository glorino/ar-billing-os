"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Plus, Trash2, Send, Save, FileText, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function NewInvoicePage() {
  const [customerId, setCustomerId] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [issueDate, setIssueDate] = React.useState<Date>();
  const [dueDate, setDueDate] = React.useState<Date>();
  const [notes, setNotes] = React.useState("");
  const [terms, setTerms] = React.useState("");
  const [showPreview, setShowPreview] = React.useState(true);
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.amount = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.08;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const customerNames: Record<string, string> = {
    acme: "Acme Corp",
    techstart: "TechStart Inc",
    global: "Global Solutions",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSend = () => {
    // Send logic here
  };

  const handleSaveDraft = () => {
    // Save draft logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
            >
              <Link href="/invoices">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Link>
            </Button>
            <div>
              <h1
                className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
              >
                Create Invoice
              </h1>
              <p className="text-slate-500 mt-1">
                Create a new invoice for your customer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="border-slate-200 hover:bg-slate-100 gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Customer Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
                <Card className="ml-4 border-slate-200/80 shadow-lg shadow-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="customer" className="text-slate-600">
                        Select Customer
                      </Label>
                      <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger className="h-11 border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all">
                          <SelectValue placeholder="Choose a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acme">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  A
                                </span>
                              </div>
                              Acme Corp
                            </div>
                          </SelectItem>
                          <SelectItem value="techstart">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  T
                                </span>
                              </div>
                              TechStart Inc
                            </div>
                          </SelectItem>
                          <SelectItem value="global">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  G
                                </span>
                              </div>
                              Global Solutions
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Details Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500" />
                <Card className="ml-4 border-slate-200/80 shadow-lg shadow-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      Invoice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-11 border-slate-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">
                            GBP - British Pound
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600">Issue Date</Label>
                        <DatePicker value={issueDate} onChange={setIssueDate} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600">Due Date</Label>
                        <DatePicker value={dueDate} onChange={setDueDate} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Line Items Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-orange-500 via-red-500 to-pink-500" />
                <Card className="ml-4 border-slate-200/80 shadow-lg shadow-slate-100">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      Line Items
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={addLineItem}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md shadow-green-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {lineItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60 hover:border-slate-300 transition-all duration-300"
                        >
                          <div className="grid gap-3 sm:grid-cols-[1fr_80px_100px_100px_36px] items-end">
                            <div className="space-y-1.5">
                              {index === 0 && (
                                <Label className="text-xs text-slate-500 uppercase tracking-wide">
                                  Description
                                </Label>
                              )}
                              <Input
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="border-slate-200 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              {index === 0 && (
                                <Label className="text-xs text-slate-500 uppercase tracking-wide">
                                  Qty
                                </Label>
                              )}
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "quantity",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="border-slate-200 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              {index === 0 && (
                                <Label className="text-xs text-slate-500 uppercase tracking-wide">
                                  Unit Price
                                </Label>
                              )}
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="border-slate-200 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              {index === 0 && (
                                <Label className="text-xs text-slate-500 uppercase tracking-wide">
                                  Amount
                                </Label>
                              )}
                              <Input
                                value={formatCurrency(item.amount)}
                                readOnly
                                className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50 font-medium text-slate-700"
                              />
                            </div>
                            <div className={index === 0 ? "pt-5" : ""}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(item.id)}
                                disabled={lineItems.length === 1}
                                className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 disabled:opacity-30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

                    {/* Totals */}
                    <div className="relative p-5 rounded-xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-blue-200/30">
                      <div className="space-y-3 ml-auto max-w-xs">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="font-medium text-slate-700">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Tax (8%)</span>
                          <span className="font-medium text-slate-700">
                            {formatCurrency(taxAmount)}
                          </span>
                        </div>
                        <Separator className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">
                            Total
                          </span>
                          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes & Terms Section */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-teal-500 via-cyan-500 to-blue-500" />
                <Card className="ml-4 border-slate-200/80 shadow-lg shadow-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-slate-600">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes for the customer"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px] border-slate-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="terms" className="text-slate-600">
                        Terms & Conditions
                      </Label>
                      <Textarea
                        id="terms"
                        placeholder="Payment terms, late fees, etc."
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="min-h-[100px] border-slate-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="h-11 px-6 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 font-medium transition-all duration-300"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  onClick={handleSend}
                  className="h-11 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 font-medium transition-all duration-300"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Invoice
                </Button>
              </div>
            </div>

            {/* Right Column - Preview */}
            {showPreview && (
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20" />
                    <Card className="relative border-0 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <FileText className="h-5 w-5 text-purple-500" />
                              Invoice Preview
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1">
                              Live preview of your invoice
                            </p>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-medium">
                            DRAFT
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">
                              INVOICE
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              #{Date.now().toString().slice(-6)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">
                              Issue Date
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {issueDate
                                ? issueDate.toLocaleDateString()
                                : "Not set"}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              Due Date
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {dueDate
                                ? dueDate.toLocaleDateString()
                                : "Not set"}
                            </p>
                          </div>
                        </div>

                        <Separator className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                        {/* Bill To */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Bill To
                          </p>
                          <p className="font-medium text-slate-700">
                            {customerId
                              ? customerNames[customerId]
                              : "No customer selected"}
                          </p>
                        </div>

                        {/* Line Items Preview */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 text-xs text-slate-500 uppercase tracking-wide pb-2 border-b border-slate-200">
                            <span>Description</span>
                            <span className="text-right">Qty</span>
                            <span className="text-right">Price</span>
                            <span className="text-right">Amount</span>
                          </div>
                          {lineItems.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[1fr_60px_80px_80px] gap-2 text-sm"
                            >
                              <span className="text-slate-700 truncate">
                                {item.description || (
                                  <span className="italic text-slate-400">
                                    No description
                                  </span>
                                )}
                              </span>
                              <span className="text-right text-slate-600">
                                {item.quantity}
                              </span>
                              <span className="text-right text-slate-600">
                                {formatCurrency(item.unitPrice)}
                              </span>
                              <span className="text-right font-medium text-slate-700">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Separator className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                        {/* Totals Preview */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="text-slate-700">
                              {formatCurrency(subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tax (8%)</span>
                            <span className="text-slate-700">
                              {formatCurrency(taxAmount)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between pt-2">
                            <span className="font-bold text-slate-800">
                              Total
                            </span>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                              {formatCurrency(total)}
                            </span>
                          </div>
                        </div>

                        {/* Notes Preview */}
                        {notes && (
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Notes
                            </p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {notes}
                            </p>
                          </div>
                        )}

                        {terms && (
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Terms & Conditions
                            </p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {terms}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
