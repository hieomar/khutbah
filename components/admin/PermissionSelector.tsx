'use client';

import React from 'react';
import { Check, Shield } from 'lucide-react';
import {
  PERMISSION_CATALOGUE,
  PERMISSIONS_BY_CATEGORY,
  PermissionId,
} from '../../lib/auth/permissions';

interface PermissionSelectorProps {
  selectedPermissions: PermissionId[];
  onChange: (permissions: PermissionId[]) => void;
  disabled?: boolean;
  canManageAdmins?: boolean;
}

export default function PermissionSelector({
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const isSelected = (id: PermissionId) => selectedPermissions.includes(id);

  const togglePermission = (id: PermissionId) => {
    if (disabled) return;
    if (isSelected(id)) {
      onChange(selectedPermissions.filter((p) => p !== id));
    } else {
      onChange([...selectedPermissions, id]);
    }
  };

  const selectCategory = (category: keyof typeof PERMISSIONS_BY_CATEGORY) => {
    if (disabled) return;
    const catPerms = PERMISSIONS_BY_CATEGORY[category].map((p) => p.id);
    const combined = Array.from(new Set([...selectedPermissions, ...catPerms]));
    onChange(combined);
  };

  const clearCategory = (category: keyof typeof PERMISSIONS_BY_CATEGORY) => {
    if (disabled) return;
    const catPermIds = new Set(PERMISSIONS_BY_CATEGORY[category].map((p) => p.id));
    onChange(selectedPermissions.filter((p) => !catPermIds.has(p)));
  };

  const selectAll = () => {
    if (disabled) return;
    onChange(PERMISSION_CATALOGUE.map((p) => p.id));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/4 rounded-xl border border-black/6 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-gold" />
          <span className="font-semibold text-[#171717]">
            {selectedPermissions.length} of {PERMISSION_CATALOGUE.length} permissions selected
          </span>
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/5 hover:bg-black/10 text-[#171717] transition-colors cursor-pointer"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      {(Object.keys(PERMISSIONS_BY_CATEGORY) as Array<keyof typeof PERMISSIONS_BY_CATEGORY>).map(
        (category) => {
          const items = PERMISSIONS_BY_CATEGORY[category];
          const allCatSelected = items.every((p) => isSelected(p.id));

          return (
            <div
              key={category}
              className="rounded-2xl bg-white border border-black/8 p-4 sm:p-5 shadow-2xs space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/6">
                <div>
                  <h4 className="font-serif-heading text-lg font-medium text-[#171717]">
                    {category}
                  </h4>
                  <p className="text-[11px] text-secondary">
                    {category === 'User Management'
                      ? 'Controls creating, editing, and inviting listeners and users'
                      : category === 'Media Management'
                      ? 'Controls uploading, publishing, archiving, and editing recordings'
                      : 'Privileged operations for delegating administrator authority'}
                  </p>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => (allCatSelected ? clearCategory(category) : selectCategory(category))}
                    className="text-[11px] font-medium text-secondary hover:text-[#171717] underline decoration-black/20 cursor-pointer"
                  >
                    {allCatSelected ? 'Clear category' : 'Select all in category'}
                  </button>
                )}
              </div>

              {/* Permissions list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {items.map((perm) => {
                  const checked = isSelected(perm.id);

                  return (
                    <label
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        checked
                          ? 'bg-surface border-[#171717]/40 shadow-xs'
                          : 'bg-transparent border-black/6 hover:border-black/20 hover:bg-black/2'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          checked
                            ? 'bg-[#171717] text-white'
                            : 'border border-black/20 bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-3" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[#171717]">
                            {perm.name}
                          </span>
                          <span className="text-[9px] font-mono text-secondary/70">
                            {perm.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary leading-snug mt-0.5">
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
