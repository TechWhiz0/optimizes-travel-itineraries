import React from 'react';
import { AlertTriangle, Shield, Eye, RefreshCw } from 'lucide-react';

const FirebaseTroubleshooting = ({ onRetry }) => {
  return (
    <div className="card border-orange-200 bg-orange-50">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">
            Firebase Connection Blocked
          </h3>
          <p className="text-orange-700 mb-4">
            Your browser extension (likely an ad blocker) is preventing the app from connecting to Firebase. 
            Here are some solutions:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Disable Ad Blocker</h4>
                <p className="text-sm text-orange-700">
                  Temporarily disable your ad blocker (uBlock Origin, AdBlock Plus, etc.) for this site
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Eye className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Use Incognito Mode</h4>
                <p className="text-sm text-orange-700">
                  Open the app in an incognito/private window where extensions are typically disabled
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RefreshCw className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Whitelist Firebase</h4>
                <p className="text-sm text-orange-700">
                  Add firestore.googleapis.com to your ad blocker's whitelist
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-orange-200">
            <button
              onClick={onRetry}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTroubleshooting;
