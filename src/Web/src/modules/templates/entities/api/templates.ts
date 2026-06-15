import type { Template } from '../model/template'

const TEMPLATES: Template[] = [
  {
    category: 'ENGINEERING',
    icon: 'terminal',
    title: 'Software Sprint',
    description: 'Standardized Agile methodology for high-velocity software development teams.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-OBHBhGFAucKbeuUn_kjD2EGtmma-kYmmA8BEiFVxUsu_Mf8n0989ZobZ-nJ_Pjx5b_ZSbxSrQ_xM2QJ5PJ9AKqe_SaYJO9dmdtTU40-_L-fd04fcK_KusKJ2T6vDf7xDg3Fg9iD53-sc5h0QWCBnBAwC4yncwau5N_RemaUoolcH7Z67MrWYxMB4508TYD7gfaM_g8J8aqtOKdff3iiTm4uLFEaEywgQRMVn4xo9r3aslvwdDsE-6w',
  },
  {
    category: 'DOCUMENTATION',
    icon: 'menu_book',
    title: 'Personal Wiki',
    description: 'A decentralized knowledge base for capturing interconnected thoughts and notes.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJIZGcnBmHrVzmAj-b887teaqwFxlJ9LA6GfDeV58t1_64wDVzLeloNKwsGvuXDy3m8MIhGFeKDLC-U02R2I2TqyRl7cFSbwsr13xlw6yGQRVBC3wxOl9my0Zo64QmjUOHRTYrjkOJZaVNpJn_Cb6wyjxmo1wwlDZHbit0OA2nus5Wld0URHaQOQ88XKmWCXi6TNB68Xb1-23jvLZ5ULXVXbWjvkSX63iCfMiezMavEL9PTJ7ZQHrFQ',
  },
  {
    category: 'SALES',
    icon: 'groups',
    title: 'CRM',
    description: 'End-to-end relationship tracking for small teams and independent consultants.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2GwypLR5OZkpmeeXV_O5y15zphOIhjqRDyGR4x1Ay-ltRwBcTiXL1Ype8dgrOi7i813cTUygXhiCEUFGrI7Ol0tbzikPhKO9EpFT3cSOSaoyuh_rm8vJLMuteibjeQSuNIdBdEqYXyaa8dL_XJkAnxc4ePfzfv_-PAHb9aw3z5FuBWcmw4rxD5OUYV2zxVW9K8YJtnwmqWL0qVRXrmZTt4bDlRPjjosiWW2L_pU7PskjSWn45eN6jSA',
  },
  {
    category: 'MANAGEMENT',
    icon: 'event',
    title: 'Meeting Minutes',
    description: 'Systematic capture of decisions, action items, and attendee contributions.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl2EqcRYEuP9HJP_6R6cGF1-s_ognM4lCVwH1Qwqs1_Zljkd98n_IjRe2K6bfC4E7qWp-NAh7Iqlgj9wnJ5ih5OZuxCYK3BKQyjrPyv1ASBgAeNhYYYugOOoUQ-mAVMzq5mrQPBvY_dXChc-sv_GWDGTMJwOcr9Zt0dHU39EecchEIk9W4p077OdIAzkVMw7afJ2yG7H_LWMYV2ojxsW1rdR_aiBXkH6OG6nLzRQNRTvgzvexGUoIkog',
  },
  {
    category: 'FINANCE',
    icon: 'account_balance',
    title: 'Invoice Tracker',
    description: 'Centralized ledger for accounts receivable and expense categorization.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr95nnKE-UxF4u_2a3osgKSJgYlTZjSzyKspdsmS2KC6bUN-aHrvIXrcSayfq1sn6O8XCW6QSMDU1F1jqDbWIUiLGdI5tQAOif9Zz-2-kRfYMhhVXK4iLPpohQvGID1mK8uJQ-mFXJNiQF-AUu3viWPEjBClBpdLz04Moiti6Wz1OGoXCCft1kDVD6-w5RL8QrBOyGHzX-0vKSOeNZpwyoo2iFpmTJ1MokaDHRJ4Au07jU6mE_jSetlw',
  },
  {
    category: 'MARKETING',
    icon: 'campaign',
    title: 'Editorial Calendar',
    description: 'Multi-channel content planning with automated status pipelines.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP_IxSu7gBMz6wpC1Flm-jPIaO_C4FP5QvW4PilJEVSJUzCm0Fiebaj52dfgbMmffuDHqYCNizZND16a9D9BrtHlevb3HNfVj7EBcMOlbJ87ONbUmkBw8HGhAdE--PLrH3Qb16kxt3TujdH_iSRF6Xs1LNBZ5TW8FQ7kjiN3FNbJlwEAMVMgaf9xo-g6LHAMRA7eqm2a_twfGg6sgIBMh59c6EHhi_4Ru1vESZHflQcB1Oqn1gdwWtfA',
  },
]

export function getTemplates(): Template[] {
  return TEMPLATES
}
