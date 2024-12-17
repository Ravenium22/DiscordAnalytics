'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Grid,
  Circle,
  Radio,
  Sliders,
  Anchor,
  User,
} from 'lucide-react';
import debounce from 'lodash.debounce';

interface Node {
  id: string;
  name: string;
  avatar: string;
  messageCount: number;
  fx?: number | null;
  fy?: number | null;
  x?: number;
  y?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  value: number;
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
}

interface DragSubject extends ForceNode {
  x: number;
  y: number;
}


type LayoutType = 'force' | 'galaxy' | 'grid' | 'circular';
type ForceNode = d3.SimulationNodeDatum & Node;
type ForceLink = d3.SimulationLinkDatum<ForceNode>;
type NetworkSimulation = d3.Simulation<ForceNode, ForceLink>;
type D3DragEvent = d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>;


const NetworkPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userLimit, setUserLimit] = useState<number>(50);
  const [isPinModeEnabled, setIsPinModeEnabled] = useState<boolean>(false);
  const [linkStrength, setLinkStrength] = useState<number>(1);
  const [layoutType, setLayoutType] = useState<LayoutType>('force');
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<NetworkSimulation | null>(null);

  // Debounced fetch to optimize performance
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchAndRenderNetwork();
    }, 300),
    [userLimit, layoutType]
  );

  useEffect(() => {
    debouncedFetch();

    // Cleanup debounce on unmount
    return () => {
      debouncedFetch.cancel();
    };
  }, [userLimit, layoutType, debouncedFetch]);

  const fetchAndRenderNetwork = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/network?limit=${userLimit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch network data');
      }

      const data: NetworkData = await response.json();

      const nodeTotalReplies = new Map<string, number>();
      data.links.forEach((link) => {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;
        const sourceTotal = nodeTotalReplies.get(sourceId) || 0;
        const targetTotal = nodeTotalReplies.get(targetId) || 0;
        nodeTotalReplies.set(sourceId, sourceTotal + link.value);
        nodeTotalReplies.set(targetId, targetTotal + link.value);
      });

      renderNetwork(data, nodeTotalReplies);
    } catch (err) {
      console.error('Error fetching network data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load network'
      );
    } finally {
      setLoading(false);
    }
  };

  const applyLayout = (
    nodes: Node[],
    width: number,
    height: number
  ) => {
    const padding = 50;

    switch (layoutType) {
      case 'galaxy':
        nodes.forEach((node, i) => {
          const angle = (i / nodes.length) * 2 * Math.PI * 3;
          const radius =
            Math.min(width, height) / 4 +
            (i / nodes.length) * Math.min(width, height) / 4;
          node.fx = width / 2 + radius * Math.cos(angle);
          node.fy = height / 2 + radius * Math.sin(angle);
        });
        break;

      case 'grid':
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const cellWidth = (width - padding * 2) / cols;
        const cellHeight = (height - padding * 2) / cols;
        nodes.forEach((node, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          node.fx = padding + col * cellWidth + cellWidth / 2;
          node.fy = padding + row * cellHeight + cellHeight / 2;
        });
        break;

      case 'circular':
        const radius = Math.min(width, height) / 2.5;
        nodes.forEach((node, i) => {
          const angle = (i / nodes.length) * 2 * Math.PI;
          node.fx = width / 2 + radius * Math.cos(angle);
          node.fy = height / 2 + radius * Math.sin(angle);
        });
        break;

      case 'force':
      default:
        nodes.forEach((node) => {
          if (!isPinModeEnabled) {
            node.fx = null;
            node.fy = null;
          }
        });
        break;
    }
  };

  const renderNetwork = (
    data: NetworkData,
    nodeTotalReplies: Map<string, number>
  ) => {
    if (!svgRef.current || !tooltipRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svgElement = svgRef.current;
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;

    const svg = d3
    .select(svgElement)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%')
    .attr('height', '100%')
    .style('min-height', '800px'); // Add minimum height

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#1a1a1a');

    // Apply chosen layout
    applyLayout(data.nodes, width, height);

    // Color scale for links
    const linkColorScale = d3
      .scaleSequential<string>()
      .domain([1, d3.max(data.links, (d) => d.value) || 1])
      .interpolator(d3.interpolateViridis);

      simulationRef.current = d3
      .forceSimulation<ForceNode>()
  .nodes(data.nodes as ForceNode[])
  .force(
    'link',
    d3
      .forceLink<ForceNode, ForceLink>(data.links as ForceLink[])
      .id((d) => d.id)
      .distance(200)  // Increased from 100 to 200
  )
  .force('charge', d3.forceManyBody<ForceNode>().strength(-1500))  // Increased repulsion
  .force('center', d3.forceCenter<ForceNode>(width / 2, height / 2))
  .force(
    'collision',
    d3.forceCollide<ForceNode>().radius((d) => Math.sqrt(d.messageCount) * 3 + 40)  // Increased radius
  );
  

    // Create links with labels
    const linkGroups = g
      .append('g')
      .selectAll('g')
      .data(data.links)
      .join('g');

    linkGroups
      .append('line')
      .attr('stroke', (d: any) => linkColorScale(d.value))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) =>
        Math.max(Math.sqrt(d.value) * linkStrength, 1)
      );

    // Add reply count labels to links
    linkGroups
      .append('text')
      .attr('dy', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .text((d: any) => {
        const sourceId =
          typeof d.source === 'string' ? d.source : d.source.id;
        const targetId =
          typeof d.target === 'string' ? d.target : d.target.id;
        const sourceTotal = nodeTotalReplies.get(sourceId) || 0;
        const targetTotal = nodeTotalReplies.get(targetId) || 0;
        return `${d.value} (${sourceTotal}↔${targetTotal})`;
      });

      const dragstarted = (
        event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, 
        d: ForceNode
      ) => {
        if (!simulationRef.current) return;
        if (!(event.sourceEvent as any).active) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      };
      
      const dragged = (
        event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, 
        d: ForceNode
      ) => {
        d.fx = event.x;
        d.fy = event.y;
      };
      
      const dragended = (
        event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, 
        d: ForceNode
      ) => {
        if (!simulationRef.current) return;
        if (!(event.sourceEvent as any).active) {
          simulationRef.current.alphaTarget(0);
        }
        if (!isPinModeEnabled) {
          d.fx = null;
          d.fy = null;
        }
      };

      const nodes = g
      .append('g')
      .selectAll<SVGGElement, ForceNode>('g')
      .data(data.nodes as ForceNode[])
      .join('g')
      .call(
        d3.drag<SVGGElement, ForceNode>()
          .on('start', dragstarted as any)
          .on('drag', dragged as any)
          .on('end', dragended as any)
      );
    nodes
    .append('circle')
    .attr('r', (d: ForceNode) => Math.sqrt(d.messageCount) * 3 + 30)  // Increased base size
    .attr('fill', '#D8382B')
    .attr('opacity', 0.8)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)  // Increased stroke width
    .attr('cursor', 'pointer')
    .transition()
    .duration(500)
    .attr('r', (d: ForceNode) => Math.sqrt(d.messageCount) * 3 + 30);

    nodes
  .append('clipPath')
  .attr('id', (d: ForceNode) => `clip-${d.id}`)
  .append('circle')
  .attr('r', (d: ForceNode) => Math.sqrt(d.messageCount) * 3 + 25);

nodes
  .append('image')
  .attr('href', (d: ForceNode) => d.avatar || '/default-avatar.png')
  .attr('x', (d: ForceNode) => -Math.sqrt(d.messageCount) * 3 - 25)
  .attr('y', (d: ForceNode) => -Math.sqrt(d.messageCount) * 3 - 25)
  .attr('width', (d: ForceNode) => (Math.sqrt(d.messageCount) * 3 + 25) * 2)
  .attr('height', (d: ForceNode) => (Math.sqrt(d.messageCount) * 3 + 25) * 2)
  .attr('clip-path', (d: ForceNode) => `url(#clip-${d.id})`)
  .attr('preserveAspectRatio', 'xMidYMid slice');

    nodes
      .on('mouseover', (event: any, d: any) => {
        const tooltip = d3.select(tooltipRef.current);
        const totalReplies = nodeTotalReplies.get(d.id) || 0;

        tooltip
          .style('opacity', 1)
          .html(
            `
              <div class="text-sm">
                <div class="font-semibold text-accent">${d.name}</div>
                <div class="text-secondary/80">Messages: ${d.messageCount}</div>
                <div class="text-secondary/80">Total Replies: ${totalReplies}</div>
                <div class="text-xs text-white/60">Double-click to view stats</div>
              </div>
            `
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .transition()
          .duration(200)
          .style('opacity', 1);

        linkGroups.style('opacity', (l: any) =>
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
        );
      })
      .on('mousemove', (event: any) => {
        d3.select(tooltipRef.current)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => {
        d3.select(tooltipRef.current)
          .transition()
          .duration(200)
          .style('opacity', 0);
        linkGroups.style('opacity', 1);
      })
      .on('dblclick', (event: any, d: any) => {
        router.push(`/stats/${d.id}`);
      });

    simulationRef.current.on('tick', () => {
      linkGroups
        .select('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkGroups
        .select('text')
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-[#1d1d1d] flex flex-col">
      <div className="flex flex-col flex-grow h-full">
        {/* Fixed Header Bar */}
        <header className="flex justify-between items-center bg-transparent p-4 z-20">
          {/* Back to Search Button */}
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            aria-label="Back to Search"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>

          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-4">
            {/* User Limit Slider */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              <span className="text-white">Users: {userLimit}</span>
              <input
                type="range"
                min="10"
                max="100"
                value={userLimit}
                onChange={(e) => setUserLimit(Number(e.target.value))}
                className="w-32 accent-accent"
                aria-label="User Limit"
              />
            </div>

            {/* Link Thickness Slider */}
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-white" />
              <span className="text-white">Link Thickness</span>
              <input
                type="range"
                min="1"
                max="10"
                value={linkStrength}
                onChange={(e) => setLinkStrength(Number(e.target.value))}
                className="w-32 accent-accent"
                aria-label="Link Thickness"
              />
            </div>

            {/* Pin Mode Toggle */}
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-white" />
              <span className="text-white">Pin Mode</span>
              <div className="flex gap-2">
                <Button
                  variant={isPinModeEnabled ? 'primary' : 'outline'}
                  onClick={() => setIsPinModeEnabled(true)}
                  className="flex-1"
                  aria-pressed={isPinModeEnabled}
                  aria-label="Enable Pin Mode"
                >
                  On
                </Button>
                <Button
                  variant={!isPinModeEnabled ? 'primary' : 'outline'}
                  onClick={() => setIsPinModeEnabled(false)}
                  className="flex-1"
                  aria-pressed={!isPinModeEnabled}
                  aria-label="Disable Pin Mode"
                >
                  Off
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Layout Controls */}
        <div className="flex justify-end p-4">
          <div className="w-56">
            <label className="text-white text-sm flex items-center gap-1 mb-2">
              <Radio className="w-4 h-4" />
              Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['force', 'galaxy', 'grid', 'circular'] as LayoutType[]).map(
                (layout) => (
                  <Button
                    key={layout}
                    variant={layoutType === layout ? 'primary' : 'outline'}
                    onClick={() => setLayoutType(layout)}
                    className="flex items-center justify-center"
                    aria-pressed={layoutType === layout}
                    aria-label={`Set layout to ${layout}`}
                  >
                    {layout === 'force' && (
                      <Circle className="mr-1 h-4 w-4" />
                    )}
                    {layout === 'grid' && <Grid className="mr-1 h-4 w-4" />}
                    {layout === 'galaxy' && (
                      <Circle className="mr-1 h-4 w-4" />
                    )}
                    {layout === 'circular' && (
                      <Circle className="mr-1 h-4 w-4" />
                    )}
                    {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <main className="flex-grow flex items-center justify-center relative">
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Visualization Container */}
          <div className="flex-grow w-full h-[800px] bg-dark/50 border border-white/10 rounded-lg">
            <svg ref={svgRef} className="w-full h-full" />
            <div
              ref={tooltipRef}
              className="absolute bg-dark/90 border border-white/10 rounded-lg p-3 pointer-events-none opacity-0 transition-opacity duration-200"
              style={{ zIndex: 1000 }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NetworkPage;
