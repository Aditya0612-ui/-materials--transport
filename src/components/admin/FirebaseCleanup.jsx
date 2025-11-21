import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { ref, remove } from 'firebase/database';
import { database } from '../../services/firebaseService';

const FirebaseCleanup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const clearAllData = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL maintenance data from Firebase.\n\nThis includes:\n- All Maintenance Schedules\n- All Service History\n- All Parts Inventory\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log('🗑️ Starting Firebase cleanup...');

      // Clear maintenance schedules
      const maintenanceRef = ref(database, 'maintenanceSchedule');
      await remove(maintenanceRef);
      console.log('✅ Cleared maintenanceSchedule');

      // Clear service history
      const serviceRef = ref(database, 'serviceHistory');
      await remove(serviceRef);
      console.log('✅ Cleared serviceHistory');

      // Clear parts inventory
      const partsRef = ref(database, 'partsInventory');
      await remove(partsRef);
      console.log('✅ Cleared partsInventory');

      setMessage({
        type: 'success',
        text: '✅ All Firebase data cleared successfully! The page will refresh in 3 seconds...'
      });

      console.log('🎉 Cleanup completed successfully!');

      // Refresh page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      setMessage({
        type: 'danger',
        text: `❌ Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-danger">
      <Card.Header className="bg-danger text-white">
        <h5 className="mb-0">
          <i className="bx bx-error-circle me-2"></i>
          Firebase Data Cleanup
        </h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="warning" className="mb-3">
          <Alert.Heading>
            <i className="bx bx-info-circle me-2"></i>
            Duplicate Data Detected
          </Alert.Heading>
          <p className="mb-2">
            Your Firebase database contains <strong>thousands of duplicate entries</strong>:
          </p>
          <ul className="mb-0">
            <li>~1291 duplicate Maintenance Schedules</li>
            <li>~1298 duplicate Service History records</li>
            <li>~2069 duplicate Parts Inventory items</li>
          </ul>
        </Alert>

        <Alert variant="info" className="mb-3">
          <strong>What this will do:</strong>
          <ul className="mb-0 mt-2">
            <li>Delete all maintenance schedules from Firebase</li>
            <li>Delete all service history records from Firebase</li>
            <li>Delete all parts inventory items from Firebase</li>
            <li>Start fresh with clean database</li>
          </ul>
        </Alert>

        {message && (
          <Alert variant={message.type} className="mb-3">
            {message.text}
          </Alert>
        )}

        <div className="d-grid gap-2">
          <Button
            variant="danger"
            size="lg"
            onClick={clearAllData}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Clearing Data...
              </>
            ) : (
              <>
                <i className="bx bx-trash me-2"></i>
                Clear All Firebase Data
              </>
            )}
          </Button>
        </div>

        <div className="mt-3 text-muted small">
          <strong>Note:</strong> After cleanup, you can add new data through the dashboard.
          The duplicate prevention system is now active to prevent this from happening again.
        </div>
      </Card.Body>
    </Card>
  );
};

export default FirebaseCleanup;
