import TestMongoForm from '@/components/TestMongoForm';

export default function TestMongoPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test MongoDB Connection
      </h1>
      <div className="max-w-md mx-auto">
        <TestMongoForm />
      </div>
    </div>
  );
} 