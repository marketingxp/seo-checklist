export function between(a:number|null,b:number|null){if(a==null&&b==null)return 1000;if(a==null&&b!=null)return b-1000;if(a!=null&&b==null)return a+1000;return (a!+b!)/2}
