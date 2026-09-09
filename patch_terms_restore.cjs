const fs = require('fs');
let content = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

const target = `              <Plus className="w-4 h-4" />
              <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Add New Clause'}</span>
            </button>
          </div>`;

const replacement = `              <Plus className="w-4 h-4" />
              <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Add New Clause'}</span>
            </button>
            <button
              onClick={() => {
                if (onUpdateTerms && window.confirm('Are you sure you want to restore the original Urdu terms? This will overwrite the current terms.')) {
                  onUpdateTerms(EXACT_TERMS_SECTIONS);
                }
              }}
              className="bg-neutral-800 hover:bg-neutral-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ml-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Original</span>
            </button>
          </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/views/AdminView.tsx', content, 'utf8');
console.log('patched terms restore button');
