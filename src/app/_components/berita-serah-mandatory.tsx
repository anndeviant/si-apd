"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, UserPlus, Users } from "lucide-react";

interface BeritaSerahMandatoryProps {
  userId: string;
}

export default function BeritaSerahMandatory({}: BeritaSerahMandatoryProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Form Serah Terima APD</span>
        </CardTitle>
        <CardDescription>
          Kelola form dan data serah terima APD untuk distribusi kepada pegawai.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Form</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Lihat Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Form Serah Terima APD
              </h3>
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p>Konten form akan dikembangkan di sini</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Lihat Data Serah Terima
              </h3>
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p>Konten data akan dikembangkan di sini</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
